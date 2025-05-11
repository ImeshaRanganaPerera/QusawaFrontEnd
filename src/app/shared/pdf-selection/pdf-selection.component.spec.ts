import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfSelectionComponent } from './pdf-selection.component';

describe('PdfSelectionComponent', () => {
  let component: PdfSelectionComponent;
  let fixture: ComponentFixture<PdfSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdfSelectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PdfSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
