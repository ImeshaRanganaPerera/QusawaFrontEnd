import { Component, inject } from '@angular/core';
import { MaterialModule } from '../../../modules/material/material.module';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ChartofAccService } from '../../../services/chartofAcc/chartof-acc.service';
import { VoucherService } from '../../../services/voucher/voucher.service';
import { APIResponse } from '../../../shared/interface';
import { differenceInCalendarDays } from 'date-fns';

@Component({
  selector: 'app-make-deposit',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './make-deposit.component.html',
  styleUrl: './make-deposit.component.scss'
})
export class MakeDepositComponent {
  isSpinning = true;
  chartofaccList: any[] = [];
  makeDepostAccList: any[] = [];
  totalAmount: number = 0;
  vouchernumber: any;

  notification = inject(NzNotificationService);
  voucherservice = inject(VoucherService);
  chartofAccService = inject(ChartofAccService);

  today = new Date();

  disabledDate = (current: Date): boolean =>
    // Can not select days before today and today
    differenceInCalendarDays(current, this.today) > 0;

  makeDepositForm: FormGroup = new FormGroup({
    date: new FormControl('', [Validators.required]),
    voucherNumber: new FormControl({ value: '', disabled: true }),
    note: new FormControl(''),
    refNumber: new FormControl(''),
    location: new FormControl(''),
    chartofAccountId: new FormControl('', [Validators.required]),
  });

  listOfData: any[] = [{ id: `${0}`, accountId: '', amount: 0 }]; // Initial row

  ngOnInit(): void {
    this.getVoucherNumber();
    this.getChartofAccounts();
    this.getmakeDepostAcc();
  }

  getChartofAccounts() {
    this.chartofAccService.getChartofacc().subscribe((res: APIResponse) => {
      this.chartofaccList = res.data;
    });
  }

  getmakeDepostAcc() {
    this.chartofAccService.getMakeDepositAcc().subscribe((res: APIResponse) => {
      this.makeDepostAccList = res.data;
      console.log(this.makeDepostAccList);
    });
  }

  getVoucherNumber() {
    this.voucherservice.getVoucherNumber('MAKE-DEPOSIT').subscribe((res: APIResponse) => {
      this.makeDepositForm.get('voucherNumber')?.setValue(res.data);
      this.vouchernumber = res.data;
      this.isSpinning = false;
    });
  }

  addRow(): void {
    this.listOfData = [
      ...this.listOfData,
      { id: `${this.listOfData.length}`, accountId: '', amount: 0 }
    ];
  }

  deleteRow(id: string): void {
    this.listOfData = this.listOfData.filter(d => d.id !== id);
    this.calculateTotals();
  }

  onAmountChange(row: any): void {
    console.log(row)
    this.calculateTotals(); // Recalculate totals after change
  }

  calculateTotals(): void {
    this.totalAmount = this.listOfData.reduce((sum, row) => sum + Number(row.amount || 0), 0);
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
      // Validate the form
      if (this.makeDepositForm.invalid) {
        Object.values(this.makeDepositForm.controls).forEach(control => {
          if (control.invalid) {
            control.markAsDirty();
            control.updateValueAndValidity({ onlySelf: true });
          }
        });
        return;
      }

      this.isSpinning = true;
      const coords = await this.getCurrentLocation();
      const location = `Latitude: ${coords.latitude}, Longitude: ${coords.longitude}`;

      // Add location to form data or process as needed
      this.makeDepositForm.get('location')?.setValue(location);

      this.isSpinning = true;

      // Prepare journal entries from listOfData
      const journalEntries = this.listOfData.map(row => ({
        accountId: row.accountId,
        debit: 0,
        credit: row.amount,
      }));
      journalEntries.push({
        accountId: this.makeDepositForm.value.chartofAccountId,
        debit: this.totalAmount,
        credit: 0,
      })

      console.log(journalEntries);

      var formData = this.makeDepositForm.value;

      const payload = {
        date: formData.date,
        chartofAccountId: formData.chartofAccountId,
        voucherNumber: this.vouchernumber,
        refNumber: formData.refNumber,
        location: formData.location,
        amount: this.totalAmount,
        note: formData.note,
        voucherGroupname: 'MAKE-DEPOSIT',
        journalEntries: journalEntries, 
      };

      this.voucherservice.create(payload).subscribe((res: APIResponse) => {
        this.isSpinning = false;
        this.notification.create('success', 'Success', res.message);
        this.resetForm();
      }, (error) => {
        this.notification.create('error', 'Error', error.error?.message || 'Something Went Wrong');
        this.isSpinning = false;
      });

    } catch (error) {
      console.error('Error submitting journal entry:', error);
      this.notification.create('error', 'Error', 'An error occurred while creating the journal entry.');
      this.isSpinning = false;
    }
  }

  resetForm() {
    this.isSpinning = true;
    this.makeDepositForm.reset();
    this.getVoucherNumber();
    this.listOfData = [];
    this.totalAmount = 0;
    this.addRow();
  }

  cancel(): void {
    this.nzMessageService.info('click cancel');
  }

  constructor(private nzMessageService: NzMessageService) { }
}
