import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockListReportComponent } from './stock-list-report.component';

describe('StockListReportComponent', () => {
  let component: StockListReportComponent;
  let fixture: ComponentFixture<StockListReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockListReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockListReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
