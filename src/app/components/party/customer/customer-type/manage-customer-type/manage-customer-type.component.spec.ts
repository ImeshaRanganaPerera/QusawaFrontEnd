import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageCustomerTypeComponent } from './manage-customer-type.component';

describe('ManageCustomerTypeComponent', () => {
  let component: ManageCustomerTypeComponent;
  let fixture: ComponentFixture<ManageCustomerTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageCustomerTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageCustomerTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
