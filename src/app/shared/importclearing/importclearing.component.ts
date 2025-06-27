import { Component, inject, OnInit } from '@angular/core';
import { MaterialModule } from './../../modules/material/material.module';
import { CommonModule } from '@angular/common';
import { VoucherService } from './../../services/voucher/voucher.service';
import { APIResponse, IVoucher } from './../../shared/interface';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { differenceInCalendarDays } from 'date-fns';
import { ChartofAccService } from './../../services/chartofAcc/chartof-acc.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { PartyService } from '../../services/party/party.service';

interface VoucherData {
  date: string;  // or Date if already parsed
  voucherNumber: string;
  // add other fields as needed
}
interface Party {
  id: string;
  name: string;
  chartofAccountId: string;
  // add any other expected properties here
}
@Component({
  selector: 'app-importclearing',
  standalone: true,
  imports: [MaterialModule, CommonModule, ReactiveFormsModule, NzFormModule],
  templateUrl: './importclearing.component.html',
  styleUrl: './importclearing.component.scss'
})
export class ImportclearingComponent implements OnInit {
  isSpinning = true;
  readonly #modal = inject(NzModalRef);
  responseMessage: any;
  chartofaccList: any[] = [];
  makeDepostAccList: any[] = [];
  totalAmount: number = 0;
  vouchernumber: any;
  amount: number = 0;
  supplierAmount: number = 0;
  date: any;
  id: any;
  partyAccountId: string = '';
  notification = inject(NzNotificationService);
  voucherservice = inject(VoucherService);
  chartofAccService = inject(ChartofAccService);
  voucherService = inject(VoucherService)
  modalRef = inject(NzModalRef)
  today = new Date();
  voucherData: IVoucher[] = [];
  disabledDate = (current: Date): boolean =>
    differenceInCalendarDays(current, this.today) > 0;
  readonly nzModalData: any = inject(NZ_MODAL_DATA);
  makeDepositForm: FormGroup = new FormGroup({
    date: new FormControl('', [Validators.required]),
    note: new FormControl(''),
    refNumber: new FormControl(''),
    chartofAccountId: new FormControl('', [Validators.required]),
    location: new FormControl('')
  });

  partyservice = inject(PartyService)
  listOfData: any[] = [{ id: `${0}`, accountId: '', amount: 0 }];
  partyData: any[] = [];
  ngOnInit(): void {
    if (this.nzModalData?.data) {
      this.getVoucherDatabyID(this.nzModalData?.data)
      this.getParty(this.nzModalData?.partyId)
      console.log(this.nzModalData?.data)
    }
    this.getChartofAccounts();
  }
  getVoucherDatabyID(id: string): void {
    this.voucherService.getbyId(id).subscribe((res: APIResponse) => {
      this.voucherData = res.data;
      const responseDate = (res.data as any)?.date;
      this.amount = (res.data as any)?.amount;
      this.id = (res.data as any)?.id;
      this.vouchernumber = (res.data as any)?.voucherNumber;
      this.makeDepositForm.patchValue({
        date: new Date(responseDate)
      });
      console.log(res.data)
    }, (error) => {
      console.error('Error fetching voucher data:', error);
    });
  }
  getChartofAccounts() {
    this.chartofAccService.getChartofacpayable().subscribe({
      next: (res: APIResponse) => {
        this.chartofaccList = res.data;

        this.isSpinning = false;
      },
      error: () => {
        this.isSpinning = false;
      }
    });
  }

  getParty(id: any) {
    this.isSpinning = true;
    this.partyservice.getbyId(id).subscribe((res: APIResponse) => {
      const data = res.data as unknown as Party;
      const firstParty = res.data[0]
      this.partyData = res.data;
      this.partyAccountId = data.chartofAccountId;
      this.isSpinning = false;
    }, (error) => {
      this.notification.create('error', 'Error', error.error?.message || 'Something went wrong!')
    })
  }

  onAmountChange(row: any): void {
    console.log(row);
    this.calculateTotals();
  }

  calculateTotals(): void {
    this.totalAmount = this.listOfData.reduce((sum, row) => sum + Number(row.amount || 0), 0);
  }

  deleteRow(id: string): void {
    this.listOfData = this.listOfData.filter(d => d.id !== id);
    this.calculateTotals();
  }

  addRow(): void {
    this.listOfData = [
      ...this.listOfData,
      { id: `${this.listOfData.length}`, accountId: '', amount: 0 }
    ];
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

  async submit(data: any) {
    try {
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
      this.makeDepositForm.get('location')?.setValue(location);

      let tempAmount = 0;

      const journalEntries = this.listOfData
        .filter(row => {
          if (row.accountId === this.partyAccountId) {
            tempAmount = row.amount; // just store amount
            return false; // skip this row in journalEntries
          }
          return row.accountId !== ''; // only include valid rows
        })
        .map(row => ({
          accountId: row.accountId,
          debit: 0,
          credit: row.amount,
        }));

      journalEntries.push({
        accountId: 'IMPORT',
        debit: this.totalAmount,
        credit: 0,
      });

      // `tempAmount` is now available for another post
      console.log('Temp Amount to be posted separately:', tempAmount);


      const formData = this.makeDepositForm.value;

      const payload = {

        ...data,

        isconform: true,
        vouchernumber: this.id,
        date: formData.date,
        value: tempAmount,
        status: 'COMPLETED',
        journalEntries: journalEntries,
      };

      this.voucherservice.updateConform(data.id, payload).subscribe({
        next: (res: APIResponse) => {
          this.isSpinning = false;
          this.notification.create('success', 'Success', res.message);
          this.resetForm();
          this.#modal.destroy({ message: this.responseMessage, data: res.data });
        },
        error: (error) => {
          this.notification.create('error', 'Error', error.error?.message || 'Something Went Wrong');
          this.isSpinning = false;
        }
      });

    } catch (error) {
      console.error('Error submitting journal entry:', error);
      this.notification.create('error', 'Error', 'An error occurred while creating the journal entry.');
      this.isSpinning = false;
    }


    //////////


  }
  updateConform(data: any) {
    // Get the updated grnValue from the form control

    const formData = this.makeDepositForm.value

    // if (Number(this.totalAmount) === 0) {
    //   this.notification.create(
    //     'error',
    //     'Value Error',
    //     `The Value Amount for ${data.voucherNumber} has to be Above 0`
    //   );
    //   return; // Stop submission
    // }

    // if (data.amount < Number(this.totalAmount)) {
    //   this.notification.create(
    //     'error',
    //     'Value Error',
    //     `The Entered Amount for ${data.voucherNumber} has to be Below ${data.amount}`
    //   );
    //   return; // Stop submission
    // }

    if (Number(this.amount) !== Number(this.totalAmount)) {
      this.notification.create(
        'error',
        'Value Error',
        `The Entered Tested`
      );
      return; // Stop submission
    }

    let tempAmount = 0;

    const journalEntries = this.listOfData
      .filter(row => {
        if (row.accountId === this.partyAccountId) {
          tempAmount = row.amount; // just store amount
          return false; // skip this row in journalEntries
        }
        return row.accountId !== ''; // only include valid rows
      })
      .map(row => ({
        accountId: row.accountId,
        debit: 0,
        credit: row.amount,
      }));

    journalEntries.push({
      accountId: 'IMPORT',
      debit: this.totalAmount,
      credit: 0,
    });

    // `tempAmount` is now available for another post
    console.log('Temp Amount to be posted separately:', tempAmount);

    const datas = {
      ...data,

      isconform: true,
      vouchernumber: this.id,
      date: formData.date,
      value: tempAmount,
      status: 'COMPLETED',
      journalEntries: journalEntries,

    }

    console.log(datas);

    this.voucherservice.updateConform(data.id, datas).subscribe((res: APIResponse) => {
      this.notification.create('success', 'Success', res.message);
      this.modalRef.destroy({ message: res.message, data: res.data });
      this.voucherData = this.voucherData.filter(voucher => voucher.id !== data.id);

    });

  }

  resetForm() {
    this.isSpinning = false;
    this.makeDepositForm.reset();
    this.listOfData = [];
    this.totalAmount = 0;
    this.addRow();
  }

  cancel(): void {
    this.nzMessageService.info('click cancel');
  }

  constructor(private nzMessageService: NzMessageService) { }
}
