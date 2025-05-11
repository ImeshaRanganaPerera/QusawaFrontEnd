import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierEnterBillComponent } from './supplier-enter-bill.component';

describe('SupplierEnterBillComponent', () => {
  let component: SupplierEnterBillComponent;
  let fixture: ComponentFixture<SupplierEnterBillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierEnterBillComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplierEnterBillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
