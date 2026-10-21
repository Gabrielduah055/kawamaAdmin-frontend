import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardSnapshot, FulfillmentStatus, PaymentStatus } from '../../core/admin.models';
import { apiErrorMessage } from '../../core/api-error';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner.component';
import { DashboardService } from './dashboard.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, CurrencyPipe, LoadingSpinnerComponent],
  templateUrl: './dashboard.page.html',
})
export class DashboardPage implements OnInit {
  loading = true;
  errorMessage = '';
  snapshot: DashboardSnapshot = {
    orders: { total: 0, pendingPayment: 0, paid: 0, refunded: 0, needsAttention: 0, awaitingDelivery: 0, delivered: 0, cancelled: 0 },
    revenue: { currency: 'GHS', grossProductRevenuePesewas: 0, collectedDeliveryFeesPesewas: 0 },
    customers: { total: 0, active: 0, repeat: 0 },
    inventory: { activeProducts: 0, reservedUnits: 0, lowStockProducts: 0, outOfStockProducts: 0 },
    recentOrders: [],
    catalog: { totalProducts: 0, draftProducts: 0 },
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

  metrics(data: DashboardSnapshot): readonly { label: string; value: string | number; note: string; icon: string; tone: string }[] {
    return [
      { label: 'Product revenue', value: this.money(data.revenue.grossProductRevenuePesewas), note: 'Verified Paystack payments', icon: 'uil-chart-growth', tone: 'bg-emerald-50 text-emerald-700' },
      { label: 'Orders', value: data.orders.total, note: `${data.orders.paid} paid`, icon: 'uil-shopping-bag', tone: 'bg-blue-50 text-blue-700' },
      { label: 'Customers', value: data.customers.total, note: `${data.customers.repeat} repeat`, icon: 'uil-users-alt', tone: 'bg-violet-50 text-violet-700' },
      { label: 'Visible products', value: data.inventory.activeProducts, note: `${data.catalog.totalProducts} across all statuses`, icon: 'uil-box', tone: 'bg-orange-50 text-kawama' },
      { label: 'Awaiting delivery', value: data.orders.awaitingDelivery, note: 'Paid and in progress', icon: 'uil-truck', tone: 'bg-amber-50 text-amber-700' },
      { label: 'Needs attention', value: data.orders.needsAttention, note: 'Payment review queue', icon: 'uil-exclamation-triangle', tone: 'bg-red-50 text-red-700' },
    ];
  }

  money(pesewas: number): string {
    return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(pesewas / 100);
  }

  paymentClass(status: PaymentStatus): string {
    return status === 'paid'
      ? 'bg-emerald-50 text-emerald-800'
      : status === 'pending'
        ? 'bg-amber-50 text-amber-800'
        : status === 'needs_attention'
          ? 'bg-red-50 text-red-800'
          : 'bg-slate-100 text-slate-700';
  }

  fulfillmentClass(status: FulfillmentStatus): string {
    return status === 'delivered'
      ? 'text-emerald-700'
      : status === 'cancelled' || status === 'needs_attention'
        ? 'text-red-700'
        : 'text-muted';
  }

  statusLabel(status: string): string {
    return status.replaceAll('_', ' ');
  }
}
