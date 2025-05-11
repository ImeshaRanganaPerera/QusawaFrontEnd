import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagePaymentReceiptComponent } from './manage-payment-receipt.component';

describe('ManagePaymentReceiptComponent', () => {
  let component: ManagePaymentReceiptComponent;
  let fixture: ComponentFixture<ManagePaymentReceiptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagePaymentReceiptComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagePaymentReceiptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
