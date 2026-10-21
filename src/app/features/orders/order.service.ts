import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AdminOrderDetail,
  AdminOrderSummary,
  ApiEnvelope,
  DeliveryFeeStatus,
  FulfillmentStatus,
  FulfillmentUpdateStatus,
  PaginatedEnvelope,
  PaymentStatus,
} from '../../core/admin.models';
import { buildApiUrl } from '../../core/endpoint';
import { toHttpParams } from '../../core/http-params';

export interface OrderQuery {
  readonly page?: number;
  readonly limit?: number;
  readonly q?: string;
  readonly paymentStatus?: PaymentStatus | '';
  readonly fulfillmentStatus?: FulfillmentStatus | '';
  readonly deliveryFeeStatus?: DeliveryFeeStatus | '';
  readonly from?: string;
  readonly to?: string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly base = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  getOrders(query: OrderQuery = {}): Observable<PaginatedEnvelope<AdminOrderSummary>> {
    return this.http.get<PaginatedEnvelope<AdminOrderSummary>>(
      buildApiUrl(this.base, environment.apiEndpoints.orders),
      { params: toHttpParams(query) },
    );
  }

  getOrder(id: string): Observable<AdminOrderDetail> {
    return this.http.get<ApiEnvelope<AdminOrderDetail>>(
      buildApiUrl(this.base, environment.apiEndpoints.orderDetail, { id }),
    ).pipe(map(({ data }) => data));
  }

  updateFulfillment(id: string, status: FulfillmentUpdateStatus): Observable<AdminOrderDetail> {
    return this.http.patch<ApiEnvelope<AdminOrderDetail>>(
      buildApiUrl(this.base, environment.apiEndpoints.orderFulfillment, { id }),
      { status },
    ).pipe(map(({ data }) => data));
  }

  updateDelivery(
    id: string,
    input: { readonly deliveryFeeStatus: DeliveryFeeStatus; readonly deliveryFee?: number },
  ): Observable<AdminOrderDetail> {
    return this.http.patch<ApiEnvelope<AdminOrderDetail>>(
      buildApiUrl(this.base, environment.apiEndpoints.orderDelivery, { id }),
      input,
    ).pipe(map(({ data }) => data));
  }
}
