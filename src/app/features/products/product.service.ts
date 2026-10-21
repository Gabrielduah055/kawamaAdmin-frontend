import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEnvelope, PaginatedEnvelope, Product, ProductInput, ProductStatus } from '../../core/admin.models';
import { buildApiUrl } from '../../core/endpoint';
import { toHttpParams } from '../../core/http-params';

export interface ProductQuery {
  readonly page?: number;
  readonly limit?: number;
  readonly q?: string;
  readonly status?: ProductStatus | '';
  readonly categoryId?: string;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly base = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  getProducts(query: ProductQuery = {}): Observable<PaginatedEnvelope<Product>> {
    return this.http.get<PaginatedEnvelope<Product>>(
      buildApiUrl(this.base, environment.apiEndpoints.products),
      {
      params: toHttpParams(query),
      },
    );
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<ApiEnvelope<Product>>(
      buildApiUrl(this.base, environment.apiEndpoints.productDetail, { id }),
    ).pipe(map(({ data }) => data));
  }

  createProduct(input: ProductInput): Observable<Product> {
    return this.http.post<ApiEnvelope<Product>>(
      buildApiUrl(this.base, environment.apiEndpoints.products),
      input,
    ).pipe(map(({ data }) => data));
  }

  updateProduct(id: string, input: ProductInput): Observable<Product> {
    return this.http.patch<ApiEnvelope<Product>>(
      buildApiUrl(this.base, environment.apiEndpoints.productDetail, { id }),
      input,
    ).pipe(map(({ data }) => data));
  }

  archiveProduct(id: string): Observable<Product> {
    return this.http.delete<ApiEnvelope<Product>>(
      buildApiUrl(this.base, environment.apiEndpoints.productDetail, { id }),
    ).pipe(map(({ data }) => data));
  }

  restoreProduct(id: string): Observable<Product> {
    return this.http.post<ApiEnvelope<Product>>(
      buildApiUrl(this.base, environment.apiEndpoints.productRestore, { id }),
      {},
    ).pipe(map(({ data }) => data));
  }
}
