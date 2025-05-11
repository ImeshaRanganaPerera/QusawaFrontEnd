import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportSelectionComponent } from './report-selection.component';

describe('ReportSelectionComponent', () => {
  let component: ReportSelectionComponent;
  let fixture: ComponentFixture<ReportSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportSelectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
