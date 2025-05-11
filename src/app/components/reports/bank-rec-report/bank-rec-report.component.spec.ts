import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankRecReportComponent } from './bank-rec-report.component';

describe('BankRecReportComponent', () => {
  let component: BankRecReportComponent;
  let fixture: ComponentFixture<BankRecReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BankRecReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BankRecReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
