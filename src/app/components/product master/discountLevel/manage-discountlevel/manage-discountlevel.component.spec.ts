import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageDiscountlevelComponent } from './manage-discountlevel.component';

describe('ManageDiscountlevelComponent', () => {
  let component: ManageDiscountlevelComponent;
  let fixture: ComponentFixture<ManageDiscountlevelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageDiscountlevelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageDiscountlevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
