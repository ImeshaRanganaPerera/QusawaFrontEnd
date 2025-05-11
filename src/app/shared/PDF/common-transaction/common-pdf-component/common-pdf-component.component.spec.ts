import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonPdfComponentComponent } from './common-pdf-component.component';

describe('CommonPdfComponentComponent', () => {
  let component: CommonPdfComponentComponent;
  let fixture: ComponentFixture<CommonPdfComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonPdfComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommonPdfComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
