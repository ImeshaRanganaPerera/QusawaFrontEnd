import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailReportpdfComponent } from './detail-reportpdf.component';

describe('DetailReportpdfComponent', () => {
  let component: DetailReportpdfComponent;
  let fixture: ComponentFixture<DetailReportpdfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailReportpdfComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailReportpdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
