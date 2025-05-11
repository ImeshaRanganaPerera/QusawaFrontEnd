import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LedgerListingComponent } from './ledger-listing.component';

describe('LedgerListingComponent', () => {
  let component: LedgerListingComponent;
  let fixture: ComponentFixture<LedgerListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LedgerListingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LedgerListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
