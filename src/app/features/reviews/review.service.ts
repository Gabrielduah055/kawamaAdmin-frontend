import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEnvelope, PaginatedEnvelope, Review, ReviewStatus } from '../../core/admin.models';
import { buildApiUrl } from '../../core/endpoint';
import { toHttpParams } from '../../core/http-params';

export interface ReviewQuery {
  readonly page?: number;
  readonly limit?: number;
  readonly status?: ReviewStatus;
  readonly productId?: string;
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly base = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  getReviews(query: ReviewQuery): Observable<PaginatedEnvelope<Review>> {
    return this.http.get<PaginatedEnvelope<Review>>(buildApiUrl(this.base, environment.apiEndpoints.reviews), {
      params: toHttpParams(query),
    });
  }

  updateReviewStatus(id: string, status: Exclude<ReviewStatus, 'pending'>): Observable<Review> {
    return this.http.patch<ApiEnvelope<Review>>(
      buildApiUrl(this.base, environment.apiEndpoints.reviewStatus, { id }),
      { status },
    ).pipe(
      map(({ data }) => data),
    );
  }

  archiveReview(id: string): Observable<void> {
    return this.http.delete<void>(buildApiUrl(this.base, environment.apiEndpoints.reviewDetail, { id }));
  }
}
