import { TestBed } from '@angular/core/testing';

import { ChequebookService } from './chequebook.service';

describe('ChequebookService', () => {
  let service: ChequebookService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChequebookService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
