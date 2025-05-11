import { TestBed } from '@angular/core/testing';

import { JournallineService } from './journalline.service';

describe('JournallineService', () => {
  let service: JournallineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JournallineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
