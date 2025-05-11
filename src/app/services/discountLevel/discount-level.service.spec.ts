import { TestBed } from '@angular/core/testing';

import { DiscountLevelService } from './discount-level.service';

describe('DiscountLevelService', () => {
  let service: DiscountLevelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DiscountLevelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
