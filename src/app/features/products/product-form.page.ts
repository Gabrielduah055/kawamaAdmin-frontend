import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, firstValueFrom, forkJoin, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category, Product, ProductImage, ProductInput } from '../../core/admin.models';
import { apiErrorMessage } from '../../core/api-error';
import { buildApiUrl } from '../../core/endpoint';
import { MediaService } from '../../core/media.service';
import { PendingChangesComponent } from '../../core/pending-changes.guard';
import { ToastService } from '../../core/toast.service';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner.component';
import { CategoryService } from '../categories/category.service';
import { ProductService } from './product.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './product-form.page.html',
})
export class ProductFormPage implements OnInit, PendingChangesComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  readonly productId = this.route.snapshot.paramMap.get('id');
  readonly isEditing = Boolean(this.productId);
  categories: readonly Category[] = [];
  currentProduct?: Product;
  images: ProductImage[] = [];
  private removedPublicIds: string[] = [];
  private saved = false;
  private imageDirty = false;
  loading = true;
  saving = false;
  uploading = false;
  loadError = '';
  submitError = '';
  uploadError = '';
  publishingError = '';
  readonly keyFeatureMaxLength = 120;

  readonly form = this.formBuilder.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
    slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), Validators.maxLength(100)]],
    categoryId: ['', Validators.required],
    shortDescription: ['', Validators.maxLength(240)],
    description: ['', Validators.maxLength(5000)],
    price: [0, [Validators.required, Validators.min(0)]],
    compareAtPrice: [null as number | null, Validators.min(0)],
    stockQuantity: [0, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
    lowStockThreshold: [5, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
    featured: [false],
    isNew: [false],
    isBestSeller: [false],
    complementaryCategoryIds: [[] as string[]],
    status: ['draft' as 'draft' | 'active'],
    details: this.formBuilder.array([]),
    specifications: this.formBuilder.array([]),
  });

  constructor(
    private readonly productService: ProductService,
    private readonly categoryService: CategoryService,
    private readonly mediaService: MediaService,
  ) {}

  get details(): FormArray { return this.form.get('details') as FormArray; }
  get specifications(): FormArray { return this.form.get('specifications') as FormArray; }
  get activeCategories(): readonly Category[] { return this.categories.filter((category) => category.status === 'active'); }
  get previewUrl(): string {
    return this.currentProduct?.status === 'active' && environment.storefrontBaseUrl
      ? buildApiUrl(environment.storefrontBaseUrl, environment.storefrontRoutes.productDetail, { slug: this.currentProduct.slug })
      : '';
  }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.loadError = '';
    forkJoin({
      categories: this.categoryService.getCategories(),
      product: this.productId ? this.productService.getProduct(this.productId) : of(undefined),
    }).subscribe({
      next: ({ categories, product }) => {
        this.categories = categories;
        if (product) this.populate(product);
        else if (!this.details.length) this.addDetail();
        this.loading = false;
      },
      error: (error) => { this.loadError = apiErrorMessage(error, 'Check the API connection and try again.'); this.loading = false; },
    });
  }

  populate(product: Product): void {
    this.currentProduct = product;
    this.images = product.images.map((image) => ({ ...image }));
    this.form.patchValue({
      name: product.name, slug: product.slug, categoryId: product.categoryId, shortDescription: product.shortDescription,
      description: product.description, price: product.price, compareAtPrice: product.compareAtPrice ?? null,
      stockQuantity: product.stockQuantity, lowStockThreshold: product.lowStockThreshold, featured: product.featured,
      isNew: product.isNew, isBestSeller: product.isBestSeller,
      complementaryCategoryIds: [...product.complementaryCategoryIds], status: product.status === 'archived' ? 'draft' : product.status,
    });
    this.details.clear();
    product.details.forEach((detail) => this.details.push(this.keyFeatureControl(detail)));
    this.specifications.clear();
    product.specifications.forEach((specification) => this.specifications.push(this.specificationGroup(specification.label, specification.value)));
    this.form.get('slug')?.disable({ emitEvent: false });
    this.form.markAsPristine();
  }

  suggestSlug(): void {
    if (this.isEditing || this.form.get('slug')?.value) return;
    const name = String(this.form.get('name')?.value || '');
    this.form.get('slug')?.setValue(name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 100));
  }

  invalid(name: string): boolean { const control = this.form.get(name); return Boolean(control?.touched && control.invalid); }
  addDetail(value = ''): void { if (this.details.length < 20) this.details.push(this.keyFeatureControl(value)); }
  removeDetail(index: number): void { this.details.removeAt(index); }
  addSpecification(): void { if (this.specifications.length < 30) this.specifications.push(this.specificationGroup()); }
  removeSpecification(index: number): void { this.specifications.removeAt(index); }
  private specificationGroup(label = '', value = ''): FormGroup { return this.formBuilder.group({ label: [label, [Validators.required, Validators.maxLength(80)]], value: [value, [Validators.required, Validators.maxLength(200)]] }); }
  private keyFeatureControl(value = '') { return this.formBuilder.control(value, [Validators.required, Validators.maxLength(this.keyFeatureMaxLength)]); }

  async uploadFiles(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []).slice(0, 8 - this.images.length);
    if (!files.length) return;
    this.uploading = true;
    this.uploadError = '';
    try {
      for (const file of files) {
        const image = await firstValueFrom(this.mediaService.uploadImage(file));
        this.images = [...this.images, { ...image, position: this.images.length }];
        this.imageDirty = true;
      }
    } catch (error) {
      this.uploadError = apiErrorMessage(error, 'One or more images could not be uploaded.');
    } finally {
      this.uploading = false;
      input.value = '';
    }
  }

  updateImageAlt(index: number, event: Event): void {
    const alt = (event.target as HTMLInputElement).value;
    this.images = this.images.map((image, imageIndex) => imageIndex === index ? { ...image, alt } : image);
    this.imageDirty = true;
  }

  moveImage(index: number, offset: number): void {
    const destination = index + offset;
    if (destination < 0 || destination >= this.images.length) return;
    const images = [...this.images];
    [images[index], images[destination]] = [images[destination], images[index]];
    this.images = images.map((image, position) => ({ ...image, position }));
    this.imageDirty = true;
  }

  removeImage(index: number): void {
    const image = this.images[index];
    if (image.publicId) this.removedPublicIds.push(image.publicId);
    this.images = this.images.filter((_, imageIndex) => imageIndex !== index).map((item, position) => ({ ...item, position }));
    this.imageDirty = true;
  }

  save(): void {
    this.submitError = '';
    this.publishingError = '';
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    if (!this.validateBusinessRules()) return;

    this.saving = true;
    const raw = this.form.getRawValue();
    const detailValues = (raw.details as unknown[]).map((detail) => String(detail ?? '').trim()).filter(Boolean);
    const specificationValues = (raw.specifications as Array<{ label?: unknown; value?: unknown }>).map((item) => ({
      label: String(item.label ?? '').trim(),
      value: String(item.value ?? '').trim(),
    })).filter((item) => item.label && item.value);
    const input: ProductInput = {
      ...(this.isEditing ? {} : { slug: String(raw.slug ?? '').trim() }),
      name: String(raw.name ?? '').trim(), categoryId: String(raw.categoryId ?? ''), shortDescription: String(raw.shortDescription ?? '').trim(), description: String(raw.description ?? '').trim(),
      price: Number(raw.price), ...(raw.compareAtPrice === null ? {} : { compareAtPrice: Number(raw.compareAtPrice) }),
      images: this.images.map((image, position) => ({ ...image, alt: image.alt.trim(), position })),
      stockQuantity: Number(raw.stockQuantity), lowStockThreshold: Number(raw.lowStockThreshold), featured: Boolean(raw.featured),
      isNew: Boolean(raw.isNew), isBestSeller: Boolean(raw.isBestSeller), complementaryCategoryIds: raw.complementaryCategoryIds || [],
      details: detailValues,
      specifications: specificationValues,
      status: (raw.status ?? 'draft') as 'draft' | 'active',
    };
    const operation = this.productId
      ? this.productService.updateProduct(this.productId, input)
      : this.productService.createProduct(input);
    operation.pipe(finalize(() => (this.saving = false))).subscribe({
      next: (product) => {
        this.saved = true;
        this.removedPublicIds.forEach((publicId) => this.mediaService.deleteUpload(publicId).subscribe({ error: () => undefined }));
        this.toast.success(this.isEditing ? 'Product changes saved.' : 'Product created.');
        void this.router.navigate(['/products'], { queryParams: { saved: product.id } });
      },
      error: (error) => (this.submitError = apiErrorMessage(error, 'Review the product fields and try again.')),
    });
  }

  private validateBusinessRules(): boolean {
    const raw = this.form.getRawValue();
    if (raw.compareAtPrice !== null && Number(raw.compareAtPrice) <= Number(raw.price)) {
      this.publishingError = 'The compare-at price must be higher than the selling price.';
      return false;
    }
    if (this.images.some((image) => image.alt.trim().length < 2)) {
      this.publishingError = 'Every image needs descriptive alternative text.';
      return false;
    }
    if (raw.status === 'active') {
      if (!String(raw.shortDescription ?? '').trim() || !String(raw.description ?? '').trim() || Number(raw.price) <= 0 || !this.images.length) {
        this.publishingError = 'Active products need a short description, full description, positive price, and at least one image.';
        return false;
      }
    }
    return true;
  }

  hasPendingChanges(): boolean { return !this.saved && (this.form.dirty || this.imageDirty); }
}
