import { TestBed } from '@angular/core/testing';

import { VoucherProductService } from './voucher-product.service';

describe('VoucherProductService', () => {
  let service: VoucherProductService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VoucherProductService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
