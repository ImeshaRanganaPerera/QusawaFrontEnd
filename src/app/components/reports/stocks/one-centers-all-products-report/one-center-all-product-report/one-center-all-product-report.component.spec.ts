import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OneCenterAllProductReportComponent } from './one-center-all-product-report.component';

describe('OneCenterAllProductReportComponent', () => {
  let component: OneCenterAllProductReportComponent;
  let fixture: ComponentFixture<OneCenterAllProductReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OneCenterAllProductReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OneCenterAllProductReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
