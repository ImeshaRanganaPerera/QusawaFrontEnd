import { TestBed } from '@angular/core/testing';

import { VisitedCustomerService } from './visited-customer.service';

describe('VisitedCustomerService', () => {
  let service: VisitedCustomerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VisitedCustomerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
