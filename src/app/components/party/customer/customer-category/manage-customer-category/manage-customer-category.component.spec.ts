import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageCustomerCategoryComponent } from './manage-customer-category.component';

describe('ManageCustomerCategoryComponent', () => {
  let component: ManageCustomerCategoryComponent;
  let fixture: ComponentFixture<ManageCustomerCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageCustomerCategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageCustomerCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
