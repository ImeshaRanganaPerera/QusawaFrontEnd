import { Component, inject, ViewContainerRef } from '@angular/core';
import { MaterialModule } from '../../../modules/material/material.module';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ChartofAccService } from '../../../services/chartofAcc/chartof-acc.service';
import { VoucherService } from '../../../services/voucher/voucher.service';
import { APIResponse } from '../../../shared/interface';
import { differenceInCalendarDays } from 'date-fns';
import { PaymentModeComponent } from '../../../shared/payment-mode/payment-mode.component';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-advance-payment',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './advance-payment.component.html',
  styleUrl: './advance-payment.component.scss'
})
export class AdvancePaymentComponent {

  isSpinning = false;
  expencessList: any[] = [];
  liabilityList: any[] = [];
  voucherNumber: any;
  responseMessage: any;
  isBlocked: boolean = false;

  voucherservice = inject(VoucherService)
  chartofaccservice = inject(ChartofAccService)
  notification = inject(NzNotificationService)
  viewContainerRef = inject(ViewContainerRef)
  modal = inject(NzModalService)

  advancePayForm: FormGroup = new FormGroup({
    date: new FormControl('', [Validators.required]),
    voucherNumber: new FormControl({ value: '', disabled: true }),
    chartofaccId: new FormControl('', [Validators.required]),
    expencessAccid: new FormControl(''),
    refNumber: new FormControl(''),
    amount: new FormControl(''),
    note: new FormControl(''),
    location: new FormControl(''),
    isChecked: new FormControl(false)
  })
  today = new Date();

  disabledDate = (current: Date): boolean =>
    // Can not select days before today and today
    differenceInCalendarDays(current, this.today) > 0;

  ngOnInit(): void {
    this.getVoucherNumber();
    this.getLiability();
  }

  getLiability() {
    this.chartofaccservice.getChartofaccbyGrp('Payable').subscribe((res: APIResponse) => {
      this.liabilityList = res.data;
    })
  }

  getVoucherNumber() {
    this.voucherservice.getVoucherNumber('ADVANCE-PAYMENT').subscribe((res: APIResponse) => {
      this.advancePayForm.get('voucherNumber')?.patchValue(res.data, { emitEvent: false });
      this.isSpinning = false;
    })
  }

  getCurrentLocation(): Promise<GeolocationCoordinates> {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => resolve(position.coords),
          error => reject(error)
        );
      } else {
        reject(new Error('Geolocation is not supported by this browser.'));
      }
    });
  }

  checkout() {
    let amount = this.advancePayForm.get('amount')?.value;
    this.paymentMode('NOCREDIT', amount, 'CREDIT')
  }

  paymentMode(mode: string, amount: any, tranType: any) {
    if (this.advancePayForm.invalid) {
      Object.values(this.advancePayForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      })
      return;
    }

    if (amount <= 0) {
      this.notification.create('error', 'Error', 'Amount should not be 0');
      return;
    }

    const modal = this.modal.create({
      nzContent: PaymentModeComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzWidth: "700px",
      nzFooter: [],
      nzData: { amount: amount, mode: mode, tranType: tranType },
    })
    modal.afterClose.subscribe((result: any) => {
      if (result && result.data) {
        if (mode === 'ALL' && result.data) {
        } else if (mode === 'NOCREDIT' && result.data) {
          this.submit(result.data)
        }
      }
      else {
        this.notification.create('info', 'Info', 'No changes were made.')
      }
    });
  }

  async submit(payments?: any) {
    try {

      this.isSpinning = true;
      const coords = await this.getCurrentLocation();
      const location = `Latitude: ${coords.latitude}, Longitude: ${coords.longitude}`;

      // Add location to form data or process as needed
      this.advancePayForm.get('location')?.setValue(location);
      var formData = this.advancePayForm.value; 

      var data = {
        date: formData.date,
        voucherNumber: this.voucherNumber,
        chartofAccountId: formData.chartofaccId,
        paidValue: 0,
        note: formData.note,
        amount: formData.amount,
        refNumber: formData.refNumber,
        location: formData.location,
        voucherGroupname: 'ADVANCE-PAYMENT',
        payment: payments,
      }
      const journalEntries = this.generateJournalEntries(data, payments);

      console.log({ ...data, journalEntries })
      this.voucherservice.create({ ...data, journalEntries }).subscribe((res: APIResponse) => {
        this.responseMessage = res.message
        this.isSpinning = false;
        this.resetForm();
        this.notification.create('success', 'Success', this.responseMessage);
      }, (error) => {
        this.responseMessage = error.error?.message || 'Something went wrong!';
        this.isSpinning = false;
        this.notification.create('error', 'Error', this.responseMessage);
      })
    } catch (error) {
      console.error('Error getting location:', error);
      this.isSpinning = false;
      this.notification.create('error', 'Error', 'Failed to get current location.');
    }
  }

  generateJournalEntries(data: any, payments: any) {
    const journalEntries: any[] = [];
    const isDebit = false;
    const isCredit = !isDebit; // For Payment and UtilityBillPayment

    // Get the correct account ID to apply the opposite entry (debit or credit)
    const chartofaccId = data.chartofAccountId;

    // Process cash payment
    if (payments.cash > 0) {
      journalEntries.push({
        accountId: "CASH", // Cash account
        debit: isCredit ? 0 : payments.cash, // Debit for Receipt
        credit: isCredit ? payments.cash : 0 // Credit for Payment or UtilityBillPayment
      });
    }

    // Process online transfer payment
    if (payments.onlineTransfer > 0 && payments.bankAccId) {
      journalEntries.push({
        accountId: payments.bankAccId, // Bank account for online transfer
        debit: isCredit ? 0 : payments.onlineTransfer,
        credit: isCredit ? payments.onlineTransfer : 0
      });
    }

    // Process cheque payment
    if (payments.cheque > 0) {
      journalEntries.push({
        accountId: "Check", // Bank account for cheque
        debit: isCredit ? 0 : payments.cheque,
        credit: isCredit ? payments.cheque : 0
      });
    }

    // Add the opposite entry for the chartofaccId (e.g., party account)
    journalEntries.push({
      accountId: chartofaccId,
      debit: isCredit ? data.amount : 0, // Debit for Payment or UtilityBillPayment
      credit: isCredit ? 0 : data.amount
    });

    return journalEntries;
  }

  resetForm() {
    this.isSpinning = true;
    this.expencessList = [];
    this.advancePayForm.reset();
    this.getVoucherNumber();
  }
}
