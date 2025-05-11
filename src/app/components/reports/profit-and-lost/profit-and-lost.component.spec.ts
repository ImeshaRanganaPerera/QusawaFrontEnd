import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfitAndLostComponent } from './profit-and-lost.component';

describe('ProfitAndLostComponent', () => {
  let component: ProfitAndLostComponent;
  let fixture: ComponentFixture<ProfitAndLostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfitAndLostComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfitAndLostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
