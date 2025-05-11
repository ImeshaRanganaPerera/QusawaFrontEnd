import { TestBed } from '@angular/core/testing';

import { ReferVoucherService } from './refer-voucher.service';

describe('ReferVoucherService', () => {
  let service: ReferVoucherService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReferVoucherService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
