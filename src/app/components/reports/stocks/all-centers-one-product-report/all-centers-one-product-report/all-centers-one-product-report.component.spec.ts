import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllCentersOneProductReportComponent } from './all-centers-one-product-report.component';

describe('AllCentersOneProductReportComponent', () => {
  let component: AllCentersOneProductReportComponent;
  let fixture: ComponentFixture<AllCentersOneProductReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllCentersOneProductReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllCentersOneProductReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
