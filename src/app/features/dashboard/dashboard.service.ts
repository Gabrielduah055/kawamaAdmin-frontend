import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEnvelope, CommerceDashboardSummary, DashboardSnapshot } from '../../core/admin.models';
import { buildApiUrl } from '../../core/endpoint';
import { ProductService } from '../products/product.service';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(
    private readonly http: HttpClient,
    private readonly productService: ProductService,
  ) {}

  getDashboard(): Observable<DashboardSnapshot> {
    return forkJoin({
      commerce: this.http.get<ApiEnvelope<CommerceDashboardSummary>>(
        buildApiUrl(environment.apiBaseUrl, environment.apiEndpoints.dashboardSummary),
      ),
      allProducts: this.productService.getProducts({ limit: 1 }),
      drafts: this.productService.getProducts({ limit: 1, status: 'draft' }),
    }).pipe(
      map(({ commerce, allProducts, drafts }) => ({
        ...commerce.data,
        catalog: {
          totalProducts: allProducts.meta.total,
          draftProducts: drafts.meta.total,
        },
      })),
    );
  }
}
