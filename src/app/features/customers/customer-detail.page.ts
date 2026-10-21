import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AdminCustomerDetail, FulfillmentStatus, PaymentStatus } from '../../core/admin.models';
import { apiErrorMessage } from '../../core/api-error';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner.component';
import { CustomerService } from './customer.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './customer-detail.page.html',
})
export class CustomerDetailPage implements OnInit {
  customer?: AdminCustomerDetail;
  loading = true;
  errorMessage = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly customerService: CustomerService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage = 'This customer link is invalid.';
      this.loading = false;
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    this.customerService.getCustomer(id).subscribe({
      next: (customer) => {
        this.customer = customer;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = apiErrorMessage(error, 'The customer could not be loaded.');
        this.loading = false;
      },
    });
  }

  paymentClass(status: PaymentStatus): string {
    if (status === 'paid') return 'bg-emerald-50 text-emerald-800';
    if (status === 'pending') return 'bg-amber-50 text-amber-800';
    if (status === 'needs_attention') return 'bg-red-50 text-red-800';
    return 'bg-slate-100 text-slate-700';
  }

  fulfillmentClass(status: FulfillmentStatus): string {
    if (status === 'delivered') return 'text-emerald-700';
    if (status === 'cancelled' || status === 'needs_attention') return 'text-red-700';
    return 'text-muted';
  }

  statusLabel(status: string): string {
    return status.replaceAll('_', ' ');
  }
}
