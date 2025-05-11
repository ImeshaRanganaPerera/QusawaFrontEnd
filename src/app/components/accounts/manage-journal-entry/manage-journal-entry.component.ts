import { Component, inject, OnInit } from '@angular/core';
import { MaterialModule } from '../../../modules/material/material.module';
import { APIResponse } from '../../../shared/interface';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { VoucherService } from '../../../services/voucher/voucher.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ChartofAccService } from '../../../services/chartofAcc/chartof-acc.service';
import { differenceInCalendarDays } from 'date-fns';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-manage-journal-entry',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './manage-journal-entry.component.html',
  styleUrl: './manage-journal-entry.component.scss'
})
export class ManageJournalEntryComponent implements OnInit {

  isSpinning = true;
  chartofaccList: any[] = [];
  totalDebit: number = 0;
  totalCredit: number = 0;
  vouchernumber: any;

  notification = inject(NzNotificationService);
  voucherservice = inject(VoucherService);
  chartofAccService = inject(ChartofAccService);

  today = new Date();

  disabledDate = (current: Date): boolean =>
    // Can not select days before today and today
    differenceInCalendarDays(current, this.today) > 0;

  journalForm: FormGroup = new FormGroup({
    date: new FormControl('', [Validators.required]),
    voucherNumber: new FormControl({ value: '', disabled: true }),
    note: new FormControl(''),
    refNumber: new FormControl(''),
    location: new FormControl(''),
  });

  listOfData: any[] = [{ id: `${0}`, accountId: '', debit: 0, credit: 0 }]; // Initial row

  ngOnInit(): void {
    this.addRow();
    this.getVoucherNumber();
    this.getChartofAccounts();
  }

  getChartofAccounts() {
    this.chartofAccService.getChartofacc().subscribe((res: APIResponse) => {
      this.chartofaccList = res.data;
    });
  }

  getVoucherNumber() {
    this.voucherservice.getVoucherNumber('JOURNAL-ENTRY').subscribe((res: APIResponse) => {
      this.journalForm.get('voucherNumber')?.setValue(res.data);
      this.vouchernumber = res.data;
      this.isSpinning = false;
    });
  }

  addRow(): void {
    this.listOfData = [
      ...this.listOfData,
      { id: `${this.listOfData.length}`, accountId: '', debit: 0, credit: 0 }
    ];
  }

  deleteRow(id: string): void {
    this.listOfData = this.listOfData.filter(d => d.id !== id);
    this.calculateTotals();
  }

  onAmountChange(row: any): void {
    if (row.credit > 0) {
      row.debit = 0; // Reset debit if credit is entered
      row.isDebitDisabled = true; // Disable debit field
      row.isCreditDisabled = false; // Ensure credit field is not disabled
    } else if (row.debit > 0) {
      row.credit = 0; // Reset credit if debit is entered
      row.isCreditDisabled = true; // Disable credit field
      row.isDebitDisabled = false; // Ensure debit field is not disabled
    }

    // Unlock fields if both debit and credit are 0
    if (row.debit === 0 && row.credit === 0) {
      row.isDebitDisabled = false;
      row.isCreditDisabled = false;
    }
    this.calculateTotals(); // Recalculate totals after change
  }


  calculateTotals(): void {
    this.totalDebit = this.listOfData.reduce((sum, row) => sum + Number(row.debit || 0), 0);
    this.totalCredit = this.listOfData.reduce((sum, row) => sum + Number(row.credit || 0), 0);
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
      if (this.journalForm.invalid) {
        Object.values(this.journalForm.controls).forEach(control => {
          if (control.invalid) {
            control.markAsDirty();
            control.updateValueAndValidity({ onlySelf: true });
          }
        });
        return;
      }

      if (this.totalCredit != this.totalDebit) {
        this.notification.create('error', 'Error', 'Credit and Debit has to be equal');
        return;
      }

      if (this.totalDebit === 0) {
        this.notification.create('error', 'Error', 'Credit and Debit has to be above');
        return;
      }

      this.isSpinning = true;
      const coords = await this.getCurrentLocation();
      const location = `Latitude: ${coords.latitude}, Longitude: ${coords.longitude}`;

      // Add location to form data or process as needed
      this.journalForm.get('location')?.setValue(location);

      this.isSpinning = true;

      // Prepare journal entries from listOfData
      const journalEntries = this.listOfData.map(row => ({
        accountId: row.accountId,
        debit: row.debit || 0,
        credit: row.credit || 0,
      }));

      var formData = this.journalForm.value;

      // Prepare payload
      const payload = {
        date: formData.date,
        voucherNumber: this.vouchernumber,
        refNumber: formData.refNumber,
        location: formData.location,
        totalDebit: this.totalCredit,
        totalCredit: this.totalDebit,
        amount: this.totalCredit,
        note: formData.note,
        voucherGroupname: 'JOURNAL-ENTRY',
        journalEntries: journalEntries, // Pass the array of journal entries
      };
      // Call the backend service
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
    this.journalForm.reset();
    this.getVoucherNumber();
    this.listOfData = [];
    this.totalDebit = 0;
    this.totalCredit = 0;
    this.addRow();
    this.addRow();
  }

  cancel(): void {
    this.nzMessageService.info('click cancel');
  }

  constructor(private nzMessageService: NzMessageService) { }


}
