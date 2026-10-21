import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminCustomer, CustomerStatus, PageMeta } from '../../core/admin.models';
import { apiErrorMessage } from '../../core/api-error';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner.component';
import { CustomerService } from './customer.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './customers.page.html',
})
export class CustomersPage implements OnInit {
  readonly search = new FormControl('', { nonNullable: true });
  customers: readonly AdminCustomer[] = [];
  meta?: PageMeta;
  status: CustomerStatus | '' = '';
  appliedSearch = '';
  page = 1;
  readonly limit = 20;
  loading = true;
  errorMessage = '';

  constructor(private readonly customerService: CustomerService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMessage = '';
    this.customerService.getCustomers({
      page: this.page,
      limit: this.limit,
      q: this.appliedSearch,
      status: this.status,
    }).subscribe({
      next: (response) => {
        this.customers = response.data;
        this.meta = response.meta;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = apiErrorMessage(error, 'Customers could not be loaded.');
        this.loading = false;
      },
    });
  }

  applySearch(): void {
    this.appliedSearch = this.search.value.trim();
    this.page = 1;
    this.load();
  }

  setStatus(event: Event): void {
    this.status = (event.target as HTMLSelectElement).value as CustomerStatus | '';
    this.page = 1;
    this.load();
  }

  clearFilters(): void {
    this.search.setValue('');
    this.appliedSearch = '';
    this.status = '';
    this.page = 1;
    this.load();
  }

  goToPage(page: number): void {
    this.page = page;
    this.load();
  }

  statusClass(status: CustomerStatus): string {
    return status === 'active' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800';
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
