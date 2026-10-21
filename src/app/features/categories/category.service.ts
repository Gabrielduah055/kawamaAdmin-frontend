import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEnvelope, Category, CategoryInput, CategoryStatus } from '../../core/admin.models';
import { buildApiUrl } from '../../core/endpoint';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly base = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  getCategories(status?: CategoryStatus): Observable<readonly Category[]> {
    const params = status ? new HttpParams().set('status', status) : undefined;
    return this.http.get<ApiEnvelope<readonly Category[]>>(
      buildApiUrl(this.base, environment.apiEndpoints.categories),
      { params },
    ).pipe(
      map(({ data }) => data),
    );
  }

  getCategory(id: string): Observable<Category> {
    return this.http.get<ApiEnvelope<Category>>(
      buildApiUrl(this.base, environment.apiEndpoints.categoryDetail, { id }),
    ).pipe(map(({ data }) => data));
  }

  createCategory(input: CategoryInput): Observable<Category> {
    return this.http.post<ApiEnvelope<Category>>(
      buildApiUrl(this.base, environment.apiEndpoints.categories),
      input,
    ).pipe(map(({ data }) => data));
  }

  updateCategory(id: string, input: CategoryInput): Observable<Category> {
    return this.http.patch<ApiEnvelope<Category>>(
      buildApiUrl(this.base, environment.apiEndpoints.categoryDetail, { id }),
      input,
    ).pipe(map(({ data }) => data));
  }

  updateCategoryOrder(items: readonly { id: string; displayOrder: number }[]): Observable<void> {
    return this.http.patch<void>(buildApiUrl(this.base, environment.apiEndpoints.categoryOrder), { items });
  }

  archiveCategory(id: string): Observable<Category> {
    return this.http.delete<ApiEnvelope<Category>>(
      buildApiUrl(this.base, environment.apiEndpoints.categoryDetail, { id }),
    ).pipe(map(({ data }) => data));
  }

  restoreCategory(id: string): Observable<Category> {
    return this.http.post<ApiEnvelope<Category>>(
      buildApiUrl(this.base, environment.apiEndpoints.categoryRestore, { id }),
      {},
    ).pipe(map(({ data }) => data));
  }
}
