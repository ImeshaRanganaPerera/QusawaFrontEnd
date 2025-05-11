import { TestBed } from '@angular/core/testing';

import { CommissionlevelService } from './commissionlevel.service';

describe('CommissionlevelService', () => {
  let service: CommissionlevelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommissionlevelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
