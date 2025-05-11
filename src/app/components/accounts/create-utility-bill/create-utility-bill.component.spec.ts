import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateUtilityBillComponent } from './create-utility-bill.component';

describe('CreateUtilityBillComponent', () => {
  let component: CreateUtilityBillComponent;
  let fixture: ComponentFixture<CreateUtilityBillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateUtilityBillComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateUtilityBillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
