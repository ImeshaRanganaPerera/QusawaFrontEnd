import { Component, inject, OnInit } from '@angular/core';
import { MaterialModule } from '../../../modules/material/material.module';
import { VoucherService } from '../../../services/voucher/voucher.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { APIResponse } from '../../../shared/interface';
import { ChartofAccService } from '../../../services/chartofAcc/chartof-acc.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { differenceInCalendarDays } from 'date-fns';

@Component({
  selector: 'app-create-utility-bill',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './create-utility-bill.component.html',
  styleUrl: './create-utility-bill.component.scss'
})
export class CreateUtilityBillComponent implements OnInit {

  isSpinning = false;
  expencessList: any[] = [];
  liabilityList: any[] = [];
  voucherNumber: any;
  responseMessage: any;
  isBlocked: boolean = false;

  voucherservice = inject(VoucherService)
  chartofaccservice = inject(ChartofAccService)
  notification = inject(NzNotificationService)

  utilityFrom: FormGroup = new FormGroup({
    date: new FormControl('', [Validators.required]),
    voucherNumber: new FormControl({ value: '', disabled: true }),
    chartofaccId: new FormControl('', [Validators.required]),
    expencessAccid: new FormControl('', [Validators.required]),
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
    this.getExpencess();
    this.getLiability();
  }

  getExpencess() {
    this.chartofaccservice.getChartofaccbyCategory('Expenses').subscribe((res: APIResponse) => {
      this.expencessList = res.data;
    })
  }

  getLiability() {
    this.chartofaccservice.getChartofaccbyGrp('Payable').subscribe((res: APIResponse) => {
      this.liabilityList = res.data;
    })
  }

  getVoucherNumber() {
    this.voucherservice.getVoucherNumber('UTILITY-BILL-CREATE').subscribe((res: APIResponse) => {
      this.utilityFrom.get('voucherNumber')?.patchValue(res.data, { emitEvent: false });
      this.isSpinning = false;
    })
  }

  check() {
    const isChecked = this.utilityFrom.get('isChecked')?.value;
    this.isBlocked = !this.isBlocked

    // Only proceed if the value has actually changed
    if (!isChecked) {
      this.utilityFrom.get('expencessAccid')?.disable();
    } else {
      this.utilityFrom.get('expencessAccid')?.enable();
    }

    // Now toggle the checkbox value
    this.utilityFrom.get('isChecked')?.setValue(!isChecked, { emitEvent: false });
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

  async submit() {
    try {

      if (this.utilityFrom.invalid) {
        Object.values(this.utilityFrom.controls).forEach(control => {
          if (control.invalid) {
            control.markAsDirty();
            control.updateValueAndValidity({ onlySelf: true });
          }
        })
        return;
      }

      this.isSpinning = true;
      const coords = await this.getCurrentLocation();
      const location = `Latitude: ${coords.latitude}, Longitude: ${coords.longitude}`;

      // Add location to form data or process as needed
      this.utilityFrom.get('location')?.setValue(location);
      var formData = this.utilityFrom.value;

      // if(this.isBlocked === false){
      //   const value = this.utilityFrom.get('expencessAccid')?.value
      //   if(value === ''){
      //     this.notification.create('error', 'Error', 'Account has to be selected')
      //     this.isSpinning = false;
      //   }
      //   return;
      // }

      const liabilityAccId = formData.chartofaccId; // Assuming you are selecting this from the form
      const debitAccountId = this.expencessList.find(item => item.name === 'SomeDebitAccountName')?.id; // Replace 'SomeDebitAccountName' with the actual name of the debit account you want

      var data = {
        date: formData.date,
        voucherNumber: this.voucherNumber,
        chartofAccountId: formData.chartofaccId,
        paidValue: 0,
        note: formData.note,
        amount: formData.amount,
        refNumber: formData.refNumber,
        location: formData.location,
        voucherGroupname: 'UTILITY-BILL-CREATE',
        journalEntries: [
          {
            accountId: liabilityAccId, // Expense account ID (Credit)
            debit: 0, // Debit for Receipt
            credit: formData.amount // Credit for Payment or 
          },
          {
            accountId: formData.expencessAccid, // Debit account ID (Debited)
            debit: formData.amount, // Debit for Receipt
            credit: 0 // Credit for Payment or 
          }
        ]
      }

      console.log(data)

      this.voucherservice.create(data).subscribe((res: APIResponse) => {
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

  resetForm() {
    this.isSpinning = true;
    this.isBlocked = false;
    this.utilityFrom.get('isChecked')?.setValue(false, { emitEvent: false });
    this.expencessList = [];
    this.utilityFrom.reset();
    this.getVoucherNumber();
  }
}
