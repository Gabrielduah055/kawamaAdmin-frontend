import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize, Subscription } from 'rxjs';
import { PageMeta, Product, Review, ReviewStatus } from '../../core/admin.models';
import { apiErrorMessage } from '../../core/api-error';
import { ToastService } from '../../core/toast.service';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner.component';
import { ProductService } from '../products/product.service';
import { ReviewService } from './review.service';

@Component({
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, LoadingSpinnerComponent],
  templateUrl: './reviews.page.html',
})
export class ReviewsPage implements OnInit, OnDestroy {
  readonly statuses = [
    { label: 'Published', value: 'approved' as const },
    { label: 'Archived', value: 'archived' as const },
    { label: 'Legacy pending', value: 'pending' as const },
    { label: 'Legacy rejected', value: 'rejected' as const },
  ];
  status: ReviewStatus = 'approved';
  productId = '';
  products: readonly Product[] = [];
  productOptionsUnavailable = false;
  reviews: readonly Review[] = [];
  meta?: PageMeta;
  page = 1;
  readonly limit = 12;
  loading = true;
  errorMessage = '';
  workingId = '';
  pendingArchive?: Review;
  editorReviewId = '';
  replyDraft = '';
  replyError = '';
  savingReplyId = '';

  private listRequest?: Subscription;
  private productRequest?: Subscription;
  private replyRequest?: Subscription;
  private archiveRequest?: Subscription;
  private listRequestVersion = 0;
  private viewVersion = 0;
  private editorVersion = 0;
  private replySaveVersion = 0;

  constructor(
    private readonly reviewService: ReviewService,
    private readonly productService: ProductService,
    private readonly toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.load();
    this.productRequest = this.productService.getProducts({ limit: 100, status: 'active' }).subscribe({
      next: (response) => {
        this.products = response.data;
        this.productOptionsUnavailable = false;
      },
      error: () => {
        this.products = [];
        this.productOptionsUnavailable = true;
      },
    });
  }

  ngOnDestroy(): void {
    this.listRequest?.unsubscribe();
    this.productRequest?.unsubscribe();
    this.replyRequest?.unsubscribe();
    this.archiveRequest?.unsubscribe();
  }

  load(): void {
    const requestVersion = ++this.listRequestVersion;
    this.listRequest?.unsubscribe();
    this.loading = true;
    this.errorMessage = '';
    this.listRequest = this.reviewService.getReviews({
      page: this.page,
      limit: this.limit,
      status: this.status,
      productId: this.productId || undefined,
    }).subscribe({
      next: (response) => {
        if (requestVersion !== this.listRequestVersion) return;
        this.reviews = response.data;
        this.meta = response.meta;
        this.loading = false;
      },
      error: (error) => {
        if (requestVersion !== this.listRequestVersion) return;
        this.errorMessage = apiErrorMessage(error);
        this.loading = false;
      },
    });
  }

  setStatus(status: ReviewStatus): void {
    if (this.status === status) return;
    this.beginViewChange();
    this.status = status;
    this.page = 1;
    this.load();
  }

  setProduct(event: Event): void {
    this.beginViewChange();
    this.productId = (event.target as HTMLSelectElement).value;
    this.page = 1;
    this.load();
  }

  goToPage(page: number): void {
    this.beginViewChange();
    this.page = page;
    this.load();
  }

  productName(review: Review): string {
    if (review.product && typeof review.product !== 'string') {
      const name = review.product.name?.trim();
      if (name) return name;
      const id = review.product.id || review.product._id;
      return id ? `Product ${id}` : 'Product review';
    }
    if (typeof review.product === 'string') {
      return this.products.find((product) => product.id === review.product)?.name || `Product ${review.product}`;
    }
    return 'Product review';
  }

  statusLabel(status: ReviewStatus): string {
    if (status === 'approved') return 'Published';
    if (status === 'pending') return 'Legacy pending';
    if (status === 'rejected') return 'Legacy rejected';
    return 'Archived';
  }

  statusClass(status: ReviewStatus): string {
    return status === 'approved'
      ? 'bg-emerald-50 text-emerald-800'
      : status === 'pending'
        ? 'bg-amber-50 text-amber-800'
        : status === 'rejected'
          ? 'bg-red-50 text-red-800'
          : 'bg-slate-100 text-slate-700';
  }

  openReplyEditor(review: Review): void {
    if (this.savingReplyId) return;
    this.clearReplyEditor();
    this.editorReviewId = review.id;
    this.replyDraft = review.reply?.text || '';
  }

  cancelReply(): void {
    if (this.savingReplyId) return;
    this.clearReplyEditor();
  }

  saveReply(review: Review): void {
    if (this.savingReplyId || this.editorReviewId !== review.id) return;

    const text = this.replyDraft.trim();
    if (text.length < 1 || text.length > 1000) {
      this.replyError = 'Reply text must be between 1 and 1000 characters after trimming.';
      return;
    }

    const viewVersion = this.viewVersion;
    const editorVersion = this.editorVersion;
    const saveVersion = ++this.replySaveVersion;
    this.savingReplyId = review.id;
    this.replyError = '';
    this.replyRequest = this.reviewService.saveReply(review.id, text).pipe(
      finalize(() => {
        if (saveVersion === this.replySaveVersion) this.savingReplyId = '';
      }),
    ).subscribe({
      next: (result) => {
        if (
          saveVersion !== this.replySaveVersion
          || viewVersion !== this.viewVersion
          || editorVersion !== this.editorVersion
          || this.editorReviewId !== review.id
        ) return;
        if (result.id !== review.id || !this.reviews.some((item) => item.id === review.id)) {
          this.replyError = 'The saved reply did not match this review. Refresh the list and try again.';
          return;
        }

        this.reviews = this.reviews.map((item) => item.id === review.id ? { ...item, reply: result.reply } : item);
        this.toast.success(review.reply ? 'Public reply updated.' : 'Public reply added.');
        this.savingReplyId = '';
        this.editorReviewId = '';
        this.replyDraft = '';
        this.replyError = '';
        this.editorVersion++;
      },
      error: (error) => {
        if (saveVersion !== this.replySaveVersion || editorVersion !== this.editorVersion) return;
        this.replyError = apiErrorMessage(error, 'The public reply could not be saved. Please try again.');
      },
    });
  }

  archive(review: Review): void {
    if (this.workingId) return;
    const viewVersion = this.viewVersion;
    this.workingId = review.id;
    this.archiveRequest = this.reviewService.archiveReview(review.id).pipe(
      finalize(() => (this.workingId = '')),
    ).subscribe({
      next: () => {
        this.toast.success('Review archived.');
        this.pendingArchive = undefined;
        if (viewVersion === this.viewVersion) this.load();
      },
      error: (error) => this.toast.error(apiErrorMessage(error, 'The review could not be archived.')),
    });
  }

  get replyLength(): number {
    return this.replyDraft.trim().length;
  }

  get replyDraftValid(): boolean {
    return this.replyLength >= 1 && this.replyLength <= 1000;
  }

  get pageCount(): number {
    return Math.max(1, Math.ceil((this.meta?.total || 0) / this.limit));
  }

  get rangeStart(): number {
    return this.meta?.total ? (this.page - 1) * this.limit + 1 : 0;
  }

  get rangeEnd(): number {
    return Math.min(this.page * this.limit, this.meta?.total || 0);
  }

  private beginViewChange(): void {
    this.viewVersion++;
    this.clearReplyEditor();
  }

  private clearReplyEditor(): void {
    this.editorVersion++;
    this.replySaveVersion++;
    this.replyRequest?.unsubscribe();
    this.replyRequest = undefined;
    this.editorReviewId = '';
    this.replyDraft = '';
    this.replyError = '';
    this.savingReplyId = '';
  }
}
