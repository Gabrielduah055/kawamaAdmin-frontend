import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardSnapshot, Product, Review } from '../../core/admin.models';
import { apiErrorMessage } from '../../core/api-error';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner.component';
import { DashboardService } from './dashboard.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, LoadingSpinnerComponent],
  templateUrl: './dashboard.page.html',
})
export class DashboardPage implements OnInit {
  loading = true;
  errorMessage = '';
  snapshot: DashboardSnapshot = {
    totalProducts: 0,
    activeProducts: 0,
    draftProducts: 0,
    categoryCount: 0,
    pendingReviewCount: 0,
    recentProducts: [],
    pendingReviews: [],
  };

  constructor(private readonly dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMessage = '';
    this.dashboardService.getDashboard().subscribe({
      next: (snapshot) => {
        this.snapshot = snapshot;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = apiErrorMessage(error, 'Check the API connection and try again.');
        this.loading = false;
      },
    });
  }

  metrics(data: DashboardSnapshot): readonly { label: string; value: number; note: string }[] {
    return [
      { label: 'All products', value: data.totalProducts, note: 'Across every status' },
      { label: 'Active', value: data.activeProducts, note: 'Visible to customers' },
      { label: 'Drafts', value: data.draftProducts, note: 'Still being prepared' },
      { label: 'Categories', value: data.categoryCount, note: 'Active collections' },
      { label: 'Pending reviews', value: data.pendingReviewCount, note: 'Need moderation' },
    ];
  }

  productName(review: Review): string {
    return typeof review.product === 'string' ? 'Product review' : review.product.name;
  }

  statusClass(status: Product['status']): string {
    return status === 'active'
      ? 'bg-emerald-50 text-emerald-800'
      : status === 'draft'
        ? 'bg-amber-50 text-amber-800'
        : 'bg-slate-100 text-slate-700';
  }
}
