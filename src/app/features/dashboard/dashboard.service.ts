import { Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { DashboardSnapshot } from '../../core/admin.models';
import { CategoryService } from '../categories/category.service';
import { ProductService } from '../products/product.service';
import { ReviewService } from '../reviews/review.service';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(
    private readonly productService: ProductService,
    private readonly categoryService: CategoryService,
    private readonly reviewService: ReviewService,
  ) {}

  getDashboard(): Observable<DashboardSnapshot> {
    return forkJoin({
      all: this.productService.getProducts({ limit: 1 }),
      active: this.productService.getProducts({ limit: 1, status: 'active' }),
      drafts: this.productService.getProducts({ limit: 1, status: 'draft' }),
      categories: this.categoryService.getCategories(),
      pendingReviews: this.reviewService.getReviews({ status: 'pending', limit: 5 }),
      recent: this.productService.getProducts({ limit: 6 }),
    }).pipe(
      map(({ all, active, drafts, categories, pendingReviews, recent }) => ({
        totalProducts: all.meta.total,
        activeProducts: active.meta.total,
        draftProducts: drafts.meta.total,
        categoryCount: categories.filter((category) => category.status === 'active').length,
        pendingReviewCount: pendingReviews.meta.total,
        recentProducts: recent.data,
        pendingReviews: pendingReviews.data,
      })),
    );
  }
}
