import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import {
  AdminOrderDetail,
  AdminPaymentAttempt,
  DeliveryFeeStatus,
  FulfillmentStatus,
  FulfillmentUpdateStatus,
  PaymentStatus,
} from '../../core/admin.models';
import { apiErrorMessage } from '../../core/api-error';
import { ToastService } from '../../core/toast.service';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner.component';
import { OrderService } from './order.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './order-detail.page.html',
})
export class OrderDetailPage implements OnInit {
  order?: AdminOrderDetail;
  loading = true;
  errorMessage = '';
  working = false;
  selectedFulfillment: FulfillmentUpdateStatus | '' = '';
  deliveryFeeStatus: DeliveryFeeStatus = 'not_quoted';
  deliveryFee = '';

  private readonly transitions: Readonly<Record<FulfillmentStatus, readonly FulfillmentUpdateStatus[]>> = {
    awaiting_payment: ['cancelled'],
    paid_awaiting_delivery: ['processing', 'out_for_delivery', 'delivered'],
    processing: ['out_for_delivery', 'delivered'],
    out_for_delivery: ['delivered'],
    delivered: [],
    cancelled: [],
    needs_attention: [],
  };

  constructor(
    private readonly route: ActivatedRoute,
    private readonly orderService: OrderService,
    private readonly toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage = 'This order link is invalid.';
      this.loading = false;
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    this.orderService.getOrder(id).subscribe({
      next: (order) => {
        this.applyOrder(order);
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = apiErrorMessage(error, 'The order could not be loaded.');
        this.loading = false;
      },
    });
  }

  setFulfillment(event: Event): void {
    this.selectedFulfillment = (event.target as HTMLSelectElement).value as FulfillmentUpdateStatus | '';
  }

  saveFulfillment(): void {
    if (!this.order || !this.selectedFulfillment) return;
    this.working = true;
    this.orderService.updateFulfillment(this.order.id, this.selectedFulfillment)
      .pipe(finalize(() => (this.working = false)))
      .subscribe({
        next: (order) => {
          this.applyOrder(order);
          this.toast.success('Order fulfillment updated.');
        },
        error: (error) => this.toast.error(apiErrorMessage(error, 'Fulfillment could not be updated.')),
      });
  }

  setDeliveryStatus(event: Event): void {
    this.deliveryFeeStatus = (event.target as HTMLSelectElement).value as DeliveryFeeStatus;
  }

  setDeliveryFee(event: Event): void {
    this.deliveryFee = (event.target as HTMLInputElement).value;
  }

  saveDelivery(): void {
    if (!this.order) return;
    const parsedFee = this.deliveryFee.trim() === '' ? undefined : Number(this.deliveryFee);
    if (parsedFee !== undefined && (!Number.isFinite(parsedFee) || parsedFee < 0)) {
      this.toast.error('Enter a valid delivery fee.');
      return;
    }
    this.working = true;
    this.orderService.updateDelivery(this.order.id, {
      deliveryFeeStatus: this.deliveryFeeStatus,
      ...(parsedFee === undefined ? {} : { deliveryFee: parsedFee }),
    }).pipe(finalize(() => (this.working = false))).subscribe({
      next: (order) => {
        this.applyOrder(order);
        this.toast.success('Delivery details updated.');
      },
      error: (error) => this.toast.error(apiErrorMessage(error, 'Delivery details could not be updated.')),
    });
  }

  availableTransitions(order: AdminOrderDetail): readonly FulfillmentUpdateStatus[] {
    return this.transitions[order.fulfillmentStatus];
  }

  paymentClass(status: PaymentStatus): string {
    if (status === 'paid') return 'bg-emerald-50 text-emerald-800';
    if (status === 'pending') return 'bg-amber-50 text-amber-800';
    if (status === 'needs_attention') return 'bg-red-50 text-red-800';
    if (status === 'refunded') return 'bg-blue-50 text-blue-800';
    return 'bg-slate-100 text-slate-700';
  }

  attemptClass(status: AdminPaymentAttempt['status']): string {
    if (status === 'success') return 'bg-emerald-50 text-emerald-800';
    if (status === 'initialized' || status === 'initializing') return 'bg-amber-50 text-amber-800';
    if (status === 'uncertain' || status === 'reconciling' || status === 'needs_attention') return 'bg-red-50 text-red-800';
    return 'bg-slate-100 text-slate-700';
  }

  statusLabel(status: string): string {
    return status.replaceAll('_', ' ');
  }

  private applyOrder(order: AdminOrderDetail): void {
    this.order = order;
    this.selectedFulfillment = '';
    this.deliveryFeeStatus = order.deliveryFeeStatus;
    this.deliveryFee = order.deliveryFeePesewas === null ? '' : String(order.deliveryFeePesewas / 100);
  }
}
