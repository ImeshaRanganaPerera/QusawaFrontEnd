import { Component, inject, OnInit } from '@angular/core';
import { MaterialModule } from '../../../../modules/material/material.module';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ChartofAccService } from '../../../../services/chartofAcc/chartof-acc.service';
import { APIResponse } from '../../../../shared/interface';
import { ChequeService } from '../../../../services/cheque/cheque.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { differenceInCalendarDays } from 'date-fns';
import { VoucherService } from '../../../../services/voucher/voucher.service';
import { JournallineService } from '../../../../services/journalLine/journalline.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-manage-bank-rec',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './manage-bank-rec.component.html',
  styleUrl: './manage-bank-rec.component.scss'
})
export class ManageBankRecComponent implements OnInit {
  isSpinning = false;

  today = new Date();

  chartofaccService = inject(ChartofAccService)
  journalLineService = inject(JournallineService)
  notification = inject(NzNotificationService)
  voucherservice = inject(VoucherService)

  disabledDate = (current: Date): boolean =>
    differenceInCalendarDays(current, this.today) > 0;

  banklist: any[] = [];
  chequeList: any[] = [];
  balance: number = 0
  selectedBankName: string = '';
  bankId: string = '';
  vouchernumber: any;
  datasource: any

  setOfCheckedId = new Set<any>();
  listOfCurrentPageData: readonly any[] = [];
  checked = false;
  indeterminate = false;
  selectedTotalAmount = 0;
  startValue = 0;
  endValue = 0;
  difference = 0;

  bankRecForm: FormGroup = new FormGroup({
    date: new FormControl('', [Validators.required]),
    daterange: new FormControl('', [Validators.required]),
    voucherNumber: new FormControl({ value: '', disabled: true }),
    note: new FormControl(''),
    refNumber: new FormControl(''),
    location: new FormControl(''),
    startValue: new FormControl('', [Validators.required]),
    endValue: new FormControl('', [Validators.required]),
    chartofAccountId: new FormControl('', [Validators.required]),
  })


  currentPage = 1;
  pageSize = 100;

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  ngOnInit(): void {
    this.getbank();
    this.getVoucherNumber();

    this.bankRecForm.get('date')?.setValue(this.today);

    this.bankRecForm.get('startValue')?.valueChanges.subscribe(value => {
      if (value) {
        this.startValue = value;
        this.calDiffrence()
      }
    })
    
    this.bankRecForm.get('endValue')?.valueChanges.subscribe(value => {
      if (value) {
        this.endValue = value;
        this.calDiffrence()
      }
    })
    
    this.bankRecForm.get('chartofAccountId')?.valueChanges.subscribe(id => {
      if (id) {
        this.bankRecForm.get('startValue')?.setValue(0);
        this.datasource = [];
        this.getJournalLines(id)
        this.getStartValue(id);
      }
    });
  }

  calDiffrence() {
    this.difference = Number(this.startValue) - Number(this.endValue)
  }

  getVoucherNumber() {
    this.voucherservice.getVoucherNumber('BANK-RECONCILIATION').subscribe((res: APIResponse) => {
      this.bankRecForm.get('voucherNumber')?.setValue(res.data);
      this.vouchernumber = res.data;
      this.isSpinning = false;
    });
  }

  getStartValue(bankId: any) {
    this.voucherservice.getStartValue(bankId).subscribe((res: APIResponse) => {
      this.bankRecForm.get('startValue')?.setValue(res.data ? res.data : 0);
    })
  }

  getSelectedBankName(chartofAccId: string): string {
    const selectedBank = this.banklist.find(bank => bank.id === chartofAccId);
    return selectedBank ? selectedBank.accountName : '';
  }

  getbank() {
    this.chartofaccService.getChartofaccbyGrp('Bank').subscribe((res: APIResponse) => {
      this.banklist = res.data;
    })
  }
  getJournalLines(id: any) {
    this.journalLineService.getBankJournalLines(id).subscribe((res: APIResponse) => {
      this.datasource = res.data
      this.pageSize = this.datasource.length
      console.log(this.datasource)
    })
  }

  getBalance(name: any) {
    this.chartofaccService.getChartofaccBalance(name).subscribe((res: APIResponse) => {
      this.balance = Number(res.data); // Directly assigning the number value
      console.log(this.balance);
    }, (error) => {
      this.balance = 0;
    });
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

  async save() {

    if (this.bankRecForm.invalid) {
      Object.values(this.bankRecForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      })
      return;
    }

    if ((Number(this.difference) + Number(this.selectedTotalAmount) !== 0)) {
      this.notification.create('error', 'Error', 'Difference has to be zero')
      return;
    }

    const coords = await this.getCurrentLocation();
    const location = `Latitude: ${coords.latitude}, Longitude: ${coords.longitude}`;

    this.bankRecForm.get('location')?.setValue(location);

    var formData = this.bankRecForm.value
    const data = {
      date: formData.date,
      startDate: formData.daterange[0],
      endDate: formData.daterange[1],
      startingValue: formData.startValue,
      endingValue: formData.endValue,
      voucherNumber: this.vouchernumber,
      location: formData.location,
      chartofAccountId: formData.chartofAccountId,
      voucherGroupname: 'BANK-RECONCILIATION',
      bankRecJournal: this.datasource,
    }
    console.log(data)

    this.voucherservice.create(data).subscribe((res: APIResponse) => {
      this.notification.create('success', 'Success', res.message)
      this.resetForm()
    }, (error) => {
      this.notification.create('error', 'Error', error.error?.message || 'Something went Wrong')
    })
  }

  onItemChecked(id: any, checked: boolean): void {
    const voucher = this.datasource.find((v: any) => v.id === id);
    if (voucher) {
      voucher.isStatus = checked;
    }

    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
    this.calculateSelectedTotal();
  }

  updateCheckedSet(id: any, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
    this.calculateSelectedTotal(); // Recalculate total whenever selection changes
  }

  calculateSelectedTotal() {
    this.selectedTotalAmount = Array.from(this.setOfCheckedId).reduce((total, id) => {
      const voucher = this.datasource.find((v: any) => v.id === id);
      return voucher ? Number(total) - Number(voucher.creditAmount) + Number(voucher.debitAmount) : total;
    }, 0);
  }

  onCurrentPageDataChange($event: readonly any[]): void {
    this.listOfCurrentPageData = $event;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.checked = this.listOfCurrentPageData.every(item => this.setOfCheckedId.has(item.id));
    this.indeterminate = this.listOfCurrentPageData.some(item => this.setOfCheckedId.has(item.id)) && !this.checked;
  }


  resetForm() {
    this.bankRecForm.reset();
    this.setOfCheckedId.clear();
    this.selectedTotalAmount = 0;
    this.startValue = 0;
    this.endValue = 0;
    this.difference = 0;
    this.datasource = [];
    this.getVoucherNumber();
    this.bankRecForm.get('date')?.setValue(this.today);
  }

  cancel(): void {
    this.nzMessageService.info('click cancel');
  }

  constructor(private nzMessageService: NzMessageService) { }

}
