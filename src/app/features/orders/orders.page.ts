import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  AdminOrderSummary,
  DeliveryFeeStatus,
  FulfillmentStatus,
  PageMeta,
  PaymentStatus,
} from '../../core/admin.models';
import { apiErrorMessage } from '../../core/api-error';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner.component';
import { OrderService } from './order.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './orders.page.html',
})
export class OrdersPage implements OnInit {
  readonly search = new FormControl('', { nonNullable: true });
  orders: readonly AdminOrderSummary[] = [];
  meta?: PageMeta;
  paymentStatus: PaymentStatus | '' = '';
  fulfillmentStatus: FulfillmentStatus | '' = '';
  deliveryFeeStatus: DeliveryFeeStatus | '' = '';
  from = '';
  to = '';
  appliedSearch = '';
  page = 1;
  readonly limit = 20;
  loading = true;
  errorMessage = '';

  constructor(private readonly orderService: OrderService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMessage = '';
    this.orderService.getOrders({
      page: this.page,
      limit: this.limit,
      q: this.appliedSearch,
      paymentStatus: this.paymentStatus,
      fulfillmentStatus: this.fulfillmentStatus,
      deliveryFeeStatus: this.deliveryFeeStatus,
      from: this.from,
      to: this.to,
    }).subscribe({
      next: (response) => {
        this.orders = response.data;
        this.meta = response.meta;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = apiErrorMessage(error, 'Orders could not be loaded.');
        this.loading = false;
      },
    });
  }

  applySearch(): void {
    this.appliedSearch = this.search.value.trim();
    this.page = 1;
    this.load();
  }

  setPaymentStatus(event: Event): void {
    this.paymentStatus = (event.target as HTMLSelectElement).value as PaymentStatus | '';
    this.page = 1;
    this.load();
  }

  setFulfillmentStatus(event: Event): void {
    this.fulfillmentStatus = (event.target as HTMLSelectElement).value as FulfillmentStatus | '';
    this.page = 1;
    this.load();
  }

  setDeliveryStatus(event: Event): void {
    this.deliveryFeeStatus = (event.target as HTMLSelectElement).value as DeliveryFeeStatus | '';
    this.page = 1;
    this.load();
  }

  setFrom(event: Event): void {
    this.from = (event.target as HTMLInputElement).value;
  }

  setTo(event: Event): void {
    this.to = (event.target as HTMLInputElement).value;
  }

  applyDates(): void {
    this.page = 1;
    this.load();
  }

  clearFilters(): void {
    this.search.setValue('');
    this.appliedSearch = '';
    this.paymentStatus = '';
    this.fulfillmentStatus = '';
    this.deliveryFeeStatus = '';
    this.from = '';
    this.to = '';
    this.page = 1;
    this.load();
  }

  goToPage(page: number): void {
    this.page = page;
    this.load();
  }

  paymentClass(status: PaymentStatus): string {
    if (status === 'paid') return 'bg-emerald-50 text-emerald-800';
    if (status === 'pending') return 'bg-amber-50 text-amber-800';
    if (status === 'needs_attention') return 'bg-red-50 text-red-800';
    if (status === 'refunded') return 'bg-blue-50 text-blue-800';
    return 'bg-slate-100 text-slate-700';
  }

  fulfillmentClass(status: FulfillmentStatus): string {
    if (status === 'delivered') return 'bg-emerald-50 text-emerald-800';
    if (status === 'cancelled' || status === 'needs_attention') return 'bg-red-50 text-red-800';
    if (status === 'awaiting_payment') return 'bg-slate-100 text-slate-700';
    return 'bg-blue-50 text-blue-800';
  }

  statusLabel(status: string): string {
    return status.replaceAll('_', ' ');
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
}
