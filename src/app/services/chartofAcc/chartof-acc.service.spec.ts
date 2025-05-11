import { TestBed } from '@angular/core/testing';

import { ChartofAccService } from './chartof-acc.service';

describe('ChartofAccService', () => {
  let service: ChartofAccService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChartofAccService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
