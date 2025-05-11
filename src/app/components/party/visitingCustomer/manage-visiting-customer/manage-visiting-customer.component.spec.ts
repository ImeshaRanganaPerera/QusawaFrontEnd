import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageVisitingCustomerComponent } from './manage-visiting-customer.component';

describe('ManageVisitingCustomerComponent', () => {
  let component: ManageVisitingCustomerComponent;
  let fixture: ComponentFixture<ManageVisitingCustomerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageVisitingCustomerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageVisitingCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
