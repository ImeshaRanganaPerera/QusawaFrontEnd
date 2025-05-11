import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllCentersAllProductsReportComponent } from './all-centers-all-products-report.component';

describe('AllCentersAllProductsReportComponent', () => {
  let component: AllCentersAllProductsReportComponent;
  let fixture: ComponentFixture<AllCentersAllProductsReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllCentersAllProductsReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllCentersAllProductsReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
