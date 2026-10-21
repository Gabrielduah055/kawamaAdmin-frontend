import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AdminCustomer,
  AdminCustomerDetail,
  ApiEnvelope,
  CustomerStatus,
  PaginatedEnvelope,
} from '../../core/admin.models';
import { buildApiUrl } from '../../core/endpoint';
import { toHttpParams } from '../../core/http-params';

export interface CustomerQuery {
  readonly page?: number;
  readonly limit?: number;
  readonly q?: string;
  readonly status?: CustomerStatus | '';
}

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly base = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  getCustomers(query: CustomerQuery = {}): Observable<PaginatedEnvelope<AdminCustomer>> {
    return this.http.get<PaginatedEnvelope<AdminCustomer>>(
      buildApiUrl(this.base, environment.apiEndpoints.customers),
      { params: toHttpParams(query) },
    );
  }

  getCustomer(id: string): Observable<AdminCustomerDetail> {
    return this.http.get<ApiEnvelope<AdminCustomerDetail>>(
      buildApiUrl(this.base, environment.apiEndpoints.customerDetail, { id }),
    ).pipe(map(({ data }) => data));
  }
}
