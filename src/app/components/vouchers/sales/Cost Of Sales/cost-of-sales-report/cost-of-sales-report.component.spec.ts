import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostOfSalesReportComponent } from './cost-of-sales-report.component';

describe('CostOfSalesReportComponent', () => {
  let component: CostOfSalesReportComponent;
  let fixture: ComponentFixture<CostOfSalesReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CostOfSalesReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CostOfSalesReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
