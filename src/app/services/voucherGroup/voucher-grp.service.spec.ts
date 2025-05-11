import { TestBed } from '@angular/core/testing';

import { VoucherGrpService } from './voucher-grp.service';

describe('VoucherGrpService', () => {
  let service: VoucherGrpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VoucherGrpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
