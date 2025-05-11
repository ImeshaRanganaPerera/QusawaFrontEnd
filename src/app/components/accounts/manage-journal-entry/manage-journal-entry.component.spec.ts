import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageJournalEntryComponent } from './manage-journal-entry.component';

describe('ManageJournalEntryComponent', () => {
  let component: ManageJournalEntryComponent;
  let fixture: ComponentFixture<ManageJournalEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageJournalEntryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageJournalEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
