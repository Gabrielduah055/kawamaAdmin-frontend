import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { OrderService } from './order.service';

describe('OrderService', () => {
  let service: OrderService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OrderService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(OrderService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('sends server-side order filters', () => {
    service.getOrders({ page: 2, limit: 20, q: 'KWM-1', paymentStatus: 'paid', from: '2026-10-01' }).subscribe();

    const request = http.expectOne((candidate) => candidate.url === '/api/v1/admin/orders');
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('limit')).toBe('20');
    expect(request.request.params.get('q')).toBe('KWM-1');
    expect(request.request.params.get('paymentStatus')).toBe('paid');
    expect(request.request.params.get('from')).toBe('2026-10-01');
    request.flush({ data: [], meta: { page: 2, limit: 20, total: 0 } });
  });

  it('uses the protected order actions', () => {
    service.updateFulfillment('order-1', 'processing').subscribe();
    const fulfillment = http.expectOne('/api/v1/admin/orders/order-1/fulfillment');
    expect(fulfillment.request.method).toBe('PATCH');
    expect(fulfillment.request.body).toEqual({ status: 'processing' });
    fulfillment.flush({ data: {} });

    service.updateDelivery('order-1', { deliveryFeeStatus: 'quoted', deliveryFee: 25 }).subscribe();
    const delivery = http.expectOne('/api/v1/admin/orders/order-1/delivery');
    expect(delivery.request.method).toBe('PATCH');
    expect(delivery.request.body).toEqual({ deliveryFeeStatus: 'quoted', deliveryFee: 25 });
    delivery.flush({ data: {} });
  });
});
