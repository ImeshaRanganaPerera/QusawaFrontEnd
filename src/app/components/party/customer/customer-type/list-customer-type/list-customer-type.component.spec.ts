import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListCustomerTypeComponent } from './list-customer-type.component';

describe('ListCustomerTypeComponent', () => {
  let component: ListCustomerTypeComponent;
  let fixture: ComponentFixture<ListCustomerTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListCustomerTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListCustomerTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
