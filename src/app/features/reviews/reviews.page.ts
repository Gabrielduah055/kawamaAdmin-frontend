import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { finalize, forkJoin } from 'rxjs';
import { PageMeta, Product, Review, ReviewStatus } from '../../core/admin.models';
import { apiErrorMessage } from '../../core/api-error';
import { ToastService } from '../../core/toast.service';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner.component';
import { ProductService } from '../products/product.service';
import { ReviewService } from './review.service';

@Component({
  standalone: true,
  imports: [CommonModule, DatePipe, LoadingSpinnerComponent],
  templateUrl: './reviews.page.html',
})
export class ReviewsPage implements OnInit {
  readonly statuses = [{ label: 'Pending', value: 'pending' as const }, { label: 'Approved', value: 'approved' as const }, { label: 'Rejected', value: 'rejected' as const }, { label: 'Archived', value: 'archived' as const }];
  status: ReviewStatus = 'pending';
  productId = '';
  products: readonly Product[] = [];
  reviews: readonly Review[] = [];
  meta?: PageMeta;
  page = 1;
  readonly limit = 12;
  loading = true;
  errorMessage = '';
  workingId = '';
  pendingArchive?: Review;

  constructor(
    private readonly reviewService: ReviewService,
    private readonly productService: ProductService,
    private readonly toast: ToastService,
  ) {}

  ngOnInit(): void {
    forkJoin({
      reviews: this.reviewService.getReviews({ status: this.status, limit: this.limit }),
      products: this.productService.getProducts({ limit: 100, status: 'active' }),
    }).subscribe({
      next: ({ reviews, products }) => { this.reviews = reviews.data; this.meta = reviews.meta; this.products = products.data; this.loading = false; },
      error: (error) => { this.errorMessage = apiErrorMessage(error); this.loading = false; },
    });
  }

  load(): void { this.loading = true; this.errorMessage = ''; this.reviewService.getReviews({ page: this.page, limit: this.limit, status: this.status, productId: this.productId || undefined }).subscribe({ next: (response) => { this.reviews = response.data; this.meta = response.meta; this.loading = false; }, error: (error) => { this.errorMessage = apiErrorMessage(error); this.loading = false; } }); }
  setStatus(status: ReviewStatus): void { this.status = status; this.page = 1; this.load(); }
  setProduct(event: Event): void { this.productId = (event.target as HTMLSelectElement).value; this.page = 1; this.load(); }
  goToPage(page: number): void { this.page = page; this.load(); }
  productName(review: Review): string { return typeof review.product === 'string' ? this.products.find((product) => product.id === review.product)?.name || 'Product review' : review.product.name; }
  statusClass(status: ReviewStatus): string { return status === 'approved' ? 'bg-emerald-50 text-emerald-800' : status === 'pending' ? 'bg-amber-50 text-amber-800' : status === 'rejected' ? 'bg-red-50 text-red-800' : 'bg-slate-100 text-slate-700'; }
  moderate(review: Review, status: 'approved' | 'rejected'): void { this.workingId = review.id; this.reviewService.updateReviewStatus(review.id, status).pipe(finalize(() => (this.workingId = ''))).subscribe({ next: () => { this.toast.success(status === 'approved' ? 'Review approved.' : 'Review rejected.'); this.load(); }, error: (error) => this.toast.error(apiErrorMessage(error, 'The review could not be updated.')) }); }
  archive(review: Review): void { this.workingId = review.id; this.reviewService.archiveReview(review.id).pipe(finalize(() => (this.workingId = ''))).subscribe({ next: () => { this.toast.success('Review archived.'); this.pendingArchive = undefined; this.load(); }, error: (error) => this.toast.error(apiErrorMessage(error, 'The review could not be archived.')) }); }
  get pageCount(): number { return Math.max(1, Math.ceil((this.meta?.total || 0) / this.limit)); }
  get rangeStart(): number { return this.meta?.total ? (this.page - 1) * this.limit + 1 : 0; }
  get rangeEnd(): number { return Math.min(this.page * this.limit, this.meta?.total || 0); }
}
