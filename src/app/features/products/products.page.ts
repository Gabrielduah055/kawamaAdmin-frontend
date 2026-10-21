import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { Category, PageMeta, Product, ProductStatus, StockLevel } from '../../core/admin.models';
import { apiErrorMessage } from '../../core/api-error';
import { ToastService } from '../../core/toast.service';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner.component';
import { CategoryService } from '../categories/category.service';
import { ProductService } from './product.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, CurrencyPipe, DatePipe, LoadingSpinnerComponent],
  templateUrl: './products.page.html',
})
export class ProductsPage implements OnInit {
  readonly search = new FormControl('', { nonNullable: true });
  products: readonly Product[] = [];
  categories: readonly Category[] = [];
  meta?: PageMeta;
  status: ProductStatus | '' = '';
  categoryId = '';
  appliedSearch = '';
  page = 1;
  readonly limit = 12;
  loading = true;
  errorMessage = '';
  pendingAction?: Product;
  actionLoading = false;

  constructor(
    private readonly productService: ProductService,
    private readonly categoryService: CategoryService,
    private readonly toast: ToastService,
  ) {}

  ngOnInit(): void {
    forkJoin({
      products: this.productService.getProducts({ limit: this.limit }),
      categories: this.categoryService.getCategories(),
    }).subscribe({
      next: ({ products, categories }) => {
        this.products = products.data;
        this.meta = products.meta;
        this.categories = categories;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = apiErrorMessage(error, 'Check the API connection and try again.');
        this.loading = false;
      },
    });
  }

  load(): void {
    this.loading = true;
    this.errorMessage = '';
    this.productService.getProducts({ page: this.page, limit: this.limit, q: this.appliedSearch, status: this.status, categoryId: this.categoryId }).subscribe({
      next: (response) => { this.products = response.data; this.meta = response.meta; this.loading = false; },
      error: (error) => { this.errorMessage = apiErrorMessage(error); this.loading = false; },
    });
  }

  applySearch(): void { this.appliedSearch = this.search.value.trim(); this.page = 1; this.load(); }
  setStatus(event: Event): void { this.status = (event.target as HTMLSelectElement).value as ProductStatus | ''; this.page = 1; this.load(); }
  setCategory(event: Event): void { this.categoryId = (event.target as HTMLSelectElement).value; this.page = 1; this.load(); }
  clearFilters(): void { this.search.setValue(''); this.appliedSearch = ''; this.status = ''; this.categoryId = ''; this.page = 1; this.load(); }
  goToPage(page: number): void { this.page = page; this.load(); }
  requestAction(product: Product): void { this.pendingAction = product; }
  cancelAction(): void { if (!this.actionLoading) this.pendingAction = undefined; }

  confirmAction(): void {
    const product = this.pendingAction;
    if (!product) return;
    this.actionLoading = true;
    const operation = product.status === 'archived'
      ? this.productService.restoreProduct(product.id)
      : this.productService.archiveProduct(product.id);
    operation.pipe(finalize(() => (this.actionLoading = false))).subscribe({
      next: () => { this.toast.success(product.status === 'archived' ? 'Product restored as a draft.' : 'Product archived.'); this.pendingAction = undefined; this.load(); },
      error: (error) => this.toast.error(apiErrorMessage(error, 'The product could not be updated.')),
    });
  }

  get pageCount(): number { return Math.max(1, Math.ceil((this.meta?.total || 0) / this.limit)); }
  get rangeStart(): number { return this.meta?.total ? (this.page - 1) * this.limit + 1 : 0; }
  get rangeEnd(): number { return Math.min(this.page * this.limit, this.meta?.total || 0); }
  statusClass(status: ProductStatus): string { return status === 'active' ? 'bg-emerald-50 text-emerald-800' : status === 'draft' ? 'bg-amber-50 text-amber-800' : 'bg-slate-100 text-slate-700'; }
  stockClass(status: StockLevel): string { return status === 'in_stock' ? 'bg-emerald-50 text-emerald-800' : status === 'low_stock' ? 'bg-amber-50 text-amber-800' : 'bg-red-50 text-red-800'; }
  stockLabel(status: StockLevel): string { return status === 'in_stock' ? 'In stock' : status === 'low_stock' ? 'Low stock' : 'Out of stock'; }
}
