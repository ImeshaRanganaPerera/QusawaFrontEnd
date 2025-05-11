import { TestBed } from '@angular/core/testing';

import { PettyCashService } from './petty-cash.service';

describe('PettyCashService', () => {
  let service: PettyCashService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PettyCashService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
