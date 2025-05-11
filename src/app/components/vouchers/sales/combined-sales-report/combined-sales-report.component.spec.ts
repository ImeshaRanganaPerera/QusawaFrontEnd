import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CombinedSalesReportComponent } from './combined-sales-report.component';

describe('CombinedSalesReportComponent', () => {
  let component: CombinedSalesReportComponent;
  let fixture: ComponentFixture<CombinedSalesReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CombinedSalesReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CombinedSalesReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
