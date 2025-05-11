import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartySettlementComponent } from './party-settlement.component';

describe('PartySettlementComponent', () => {
  let component: PartySettlementComponent;
  let fixture: ComponentFixture<PartySettlementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartySettlementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartySettlementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
