import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CustomerService } from './customer.service';

describe('CustomerService', () => {
  let service: CustomerService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CustomerService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CustomerService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads filtered verified customers', () => {
    service.getCustomers({ page: 1, limit: 20, q: 'Ama', status: 'active' }).subscribe();

    const request = http.expectOne((candidate) => candidate.url === '/api/v1/admin/customers');
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('q')).toBe('Ama');
    expect(request.request.params.get('status')).toBe('active');
    request.flush({ data: [], meta: { page: 1, limit: 20, total: 0 } });
  });

  it('loads a customer detail by id', () => {
    service.getCustomer('customer-1').subscribe();
    const request = http.expectOne('/api/v1/admin/customers/customer-1');
    expect(request.request.method).toBe('GET');
    request.flush({ data: { id: 'customer-1' } });
  });
});
