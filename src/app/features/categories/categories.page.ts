import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, firstValueFrom } from 'rxjs';
import { Category, CategoryInput, ProductImage } from '../../core/admin.models';
import { apiErrorMessage } from '../../core/api-error';
import { MediaService } from '../../core/media.service';
import { ToastService } from '../../core/toast.service';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner.component';
import { CategoryService } from './category.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe, LoadingSpinnerComponent],
  templateUrl: './categories.page.html',
})
export class CategoriesPage implements OnInit {
  private readonly toast = inject(ToastService);
  private readonly formBuilder = inject(FormBuilder);
  categories: readonly Category[] = [];
  status: '' | 'active' | 'archived' = '';
  loading = true;
  errorMessage = '';
  reordering = false;
  editorOpen = false;
  editingCategory?: Category;
  categoryImage?: Omit<ProductImage, 'position'>;
  private removedImagePublicId?: string;
  imageUploading = false;
  formSaving = false;
  formError = '';
  pendingAction?: Category;
  actionLoading = false;
  readonly Boolean = Boolean;
  readonly statusOptions = [{ label: 'All', value: '' as const }, { label: 'Active', value: 'active' as const }, { label: 'Archived', value: 'archived' as const }];
  readonly form = this.formBuilder.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), Validators.maxLength(100)]],
    description: ['', Validators.maxLength(500)],
    displayOrder: [0, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
  });

  constructor(
    private readonly categoryService: CategoryService,
    private readonly mediaService: MediaService,
  ) {}

  ngOnInit(): void { this.load(); }
  load(): void { this.loading = true; this.errorMessage = ''; this.categoryService.getCategories(this.status || undefined).subscribe({ next: (categories) => { this.categories = categories; this.loading = false; }, error: (error) => { this.errorMessage = apiErrorMessage(error); this.loading = false; } }); }
  setStatus(status: typeof this.status): void { this.status = status; this.load(); }
  openCreate(): void { this.editingCategory = undefined; this.categoryImage = undefined; this.removedImagePublicId = undefined; this.form.reset({ name: '', slug: '', description: '', displayOrder: this.categories.length }); this.form.get('slug')?.enable(); this.formError = ''; this.editorOpen = true; }
  openEdit(category: Category): void { this.editingCategory = category; this.categoryImage = category.image ? { ...category.image } : undefined; this.removedImagePublicId = undefined; this.form.reset({ name: category.name, slug: category.slug, description: category.description, displayOrder: category.displayOrder }); this.form.get('slug')?.disable(); this.formError = ''; this.editorOpen = true; }
  closeEditor(): void { if (!this.formSaving) this.editorOpen = false; }
  controlInvalid(name: string): boolean { const control = this.form.get(name); return Boolean(control?.touched && control.invalid); }
  suggestCategorySlug(): void { if (this.editingCategory || this.form.get('slug')?.value) return; const name = String(this.form.get('name')?.value || ''); this.form.get('slug')?.setValue(name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 100)); }

  async uploadCategoryImage(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.imageUploading = true;
    this.formError = '';
    try {
      const previousPublicId = this.categoryImage?.publicId;
      const image = await firstValueFrom(this.mediaService.uploadImage(file));
      if (previousPublicId) this.removedImagePublicId = previousPublicId;
      this.categoryImage = { src: image.src, publicId: image.publicId, alt: image.alt };
    }
    catch (error) { this.formError = apiErrorMessage(error, 'The category image could not be uploaded.'); }
    finally { this.imageUploading = false; input.value = ''; }
  }

  updateCategoryImageAlt(event: Event): void { if (this.categoryImage) this.categoryImage = { ...this.categoryImage, alt: (event.target as HTMLInputElement).value }; }
  removeCategoryImage(): void { if (this.categoryImage?.publicId) this.removedImagePublicId = this.categoryImage.publicId; this.categoryImage = undefined; }

  saveCategory(): void {
    this.form.markAllAsTouched(); this.formError = '';
    if (this.form.invalid) return;
    if (this.categoryImage && this.categoryImage.alt.trim().length < 2) { this.formError = 'The image needs descriptive alternative text.'; return; }
    const raw = this.form.getRawValue();
    const input: CategoryInput = {
      name: raw.name!.trim(),
      description: raw.description!.trim(),
      displayOrder: Number(raw.displayOrder),
      ...(this.categoryImage ? { image: { ...this.categoryImage, alt: this.categoryImage.alt.trim() } } : {}),
      ...(this.editingCategory ? {} : { slug: raw.slug!.trim(), status: 'active' as const }),
    };
    this.formSaving = true;
    const operation = this.editingCategory
      ? this.categoryService.updateCategory(this.editingCategory.id, input)
      : this.categoryService.createCategory(input);
    operation.pipe(finalize(() => (this.formSaving = false))).subscribe({
      next: () => { if (this.removedImagePublicId) this.mediaService.deleteUpload(this.removedImagePublicId).subscribe({ error: () => undefined }); this.toast.success(this.editingCategory ? 'Category changes saved.' : 'Category created.'); this.editorOpen = false; this.load(); },
      error: (error) => (this.formError = apiErrorMessage(error, 'The category could not be saved.')),
    });
  }

  move(index: number, offset: number): void {
    const destination = index + offset;
    if (destination < 0 || destination >= this.categories.length) return;
    const reordered = [...this.categories]; [reordered[index], reordered[destination]] = [reordered[destination], reordered[index]];
    this.categories = reordered; this.reordering = true;
    this.categoryService.updateCategoryOrder(reordered.map((category, displayOrder) => ({ id: category.id, displayOrder }))).pipe(finalize(() => (this.reordering = false))).subscribe({ next: () => this.toast.success('Category order updated.'), error: (error) => { this.toast.error(apiErrorMessage(error, 'The category order could not be saved.')); this.load(); } });
  }

  confirmCategoryAction(): void {
    const category = this.pendingAction; if (!category) return;
    this.actionLoading = true;
    const operation = category.status === 'active'
      ? this.categoryService.archiveCategory(category.id)
      : this.categoryService.restoreCategory(category.id);
    operation.pipe(finalize(() => (this.actionLoading = false))).subscribe({ next: () => { this.toast.success(category.status === 'active' ? 'Category archived.' : 'Category restored.'); this.pendingAction = undefined; this.load(); }, error: (error) => this.toast.error(apiErrorMessage(error, 'The category could not be updated.')) });
  }
}
