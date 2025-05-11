import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OneCenterOneProductReportComponent } from './one-center-one-product-report.component';

describe('OneCenterOneProductReportComponent', () => {
  let component: OneCenterOneProductReportComponent;
  let fixture: ComponentFixture<OneCenterOneProductReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OneCenterOneProductReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OneCenterOneProductReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
