import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportPdfComponent } from './report-pdf.component';

describe('ReportPdfComponent', () => {
  let component: ReportPdfComponent;
  let fixture: ComponentFixture<ReportPdfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportPdfComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportPdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
