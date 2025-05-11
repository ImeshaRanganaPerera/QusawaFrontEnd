import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListCustomerCategoryComponent } from './list-customer-category.component';

describe('ListCustomerCategoryComponent', () => {
  let component: ListCustomerCategoryComponent;
  let fixture: ComponentFixture<ListCustomerCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListCustomerCategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListCustomerCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
