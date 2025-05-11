import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitingCustomerListComponent } from './visiting-customer-list.component';

describe('VisitingCustomerListComponent', () => {
  let component: VisitingCustomerListComponent;
  let fixture: ComponentFixture<VisitingCustomerListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitingCustomerListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisitingCustomerListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
