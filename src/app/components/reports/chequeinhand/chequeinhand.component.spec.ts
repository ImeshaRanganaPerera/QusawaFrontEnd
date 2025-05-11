import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChequeinhandComponent } from './chequeinhand.component';

describe('ChequeinhandComponent', () => {
  let component: ChequeinhandComponent;
  let fixture: ComponentFixture<ChequeinhandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChequeinhandComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChequeinhandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
