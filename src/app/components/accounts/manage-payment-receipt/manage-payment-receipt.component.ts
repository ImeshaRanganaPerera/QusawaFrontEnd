import { Component, inject, ViewContainerRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MaterialModule } from '../../../modules/material/material.module';
import { VoucherService } from '../../../services/voucher/voucher.service';
import { APIResponse, IParty, ItemData, IVoucher } from '../../../shared/interface';
import { PartyService } from '../../../services/party/party.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { PaymentModeComponent } from '../../../shared/payment-mode/payment-mode.component';
import { differenceInCalendarDays } from 'date-fns';
import { ChartofAccService } from '../../../services/chartofAcc/chartof-acc.service';
import { PdfSelectionComponent } from '../../../shared/pdf-selection/pdf-selection.component';
import { NzMessageService } from 'ng-zorro-antd/message';
import { RefVouchersComponent } from '../../../shared/ref-vouchers/ref-vouchers.component';
import { CurrencyService } from '../../../services/currency/currency.service';

@Component({
  selector: 'app-manage-payment-receipt',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './manage-payment-receipt.component.html',
  styleUrl: './manage-payment-receipt.component.scss'
})
export class ManagePaymentReceiptComponent {
  today = new Date();

  disabledDate = (current: Date): boolean =>
    // Can not select days before today and today
    differenceInCalendarDays(current, this.today) > 0;

  isSpinning = true;
  params: string = '';
  name: string = '';
  invoiceNumber: any
  partyname: any
  vouchermode: any
  partyData: IParty[] = []
  voucherData: IVoucher[] = []
  liabilityList: any[] = [];
  totalAmount: number = 0;
  payingAmount: number = 0;
  responseMessage: any
  refVoucherNumber: any
  lkrAmount: number = 0;
  usdAmount:number = 0;
  checked = false;
  indeterminate = false;
  isRef = false;
  listOfCurrentPageData: readonly any[] = [];
  setOfCheckedId = new Set<any>();
  selectedTotalAmount = 0;
  advanceAmount = 0;

  currencyservice = inject(CurrencyService)

  route = inject(ActivatedRoute)
  voucherservice = inject(VoucherService)
  partyservice = inject(PartyService)
  modal = inject(NzModalService)
  viewContainerRef = inject(ViewContainerRef)
  notification = inject(NzNotificationService)
  chartofaccservice = inject(ChartofAccService)


  voucherForm: FormGroup = new FormGroup({
    date: new FormControl('', [Validators.required]),
    partyId: new FormControl(''),
    chartofaccId: new FormControl(''),
    note: new FormControl(''),
    amount: new FormControl(''),
    advanceAmount: new FormControl({ value: '', disabled: true }),
    location: new FormControl(''),
    totalAmount: new FormControl({ value: '', disabled: true }),
    paidAmount: new FormControl(''),
    dueBalance: new FormControl({ value: '', disabled: true }),
  })

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.params = params['type'];
    })
    this.currencyservice.get(1, 'LKR').subscribe({
      next: (res) => {
        this.usdAmount = res.amountInUSD;
        this.lkrAmount = res.amountLkr;
      },
      error: () => {
        this.usdAmount = 0;
      },
    })

    if (this.params === "Payment") {
      this.partyname = "SUPPLIER"
      this.vouchermode = "PAYMENT"
      this.name = "Supplier Payment"
      this.voucherForm.get('partyId')?.valueChanges.subscribe(partyId => {
        if (partyId) {
          this.getRefVouchers('ADVANCE-PAYMENT', partyId);
        }
      });
    }
    else if (this.params === "Receipt") {
      this.partyname = "CUSTOMER"
      this.vouchermode = "RECEIPT"
      this.name = "Customer Receipt"
    }
    else if (this.params === "DirectPayment") {
      this.partyname = "SUPPLIER"
      this.vouchermode = "DIRECT PAYMENT"
      this.name = "Direct Supplier Payment"
    }
    else if (this.params === "UtilityBillPayment") {
      this.vouchermode = "UTILITY-BILL-PAYMENT"
      this.name = "Utility Bill Payment"
      this.voucherForm.get('chartofaccId')?.setValidators([Validators.required]);
      this.voucherForm.get('chartofaccId')?.updateValueAndValidity();
    }

    if (this.params === "UtilityBillPayment") {
      this.getExpencessAcc('Payable')
      this.voucherForm.get('chartofaccId')?.valueChanges.subscribe(chartofaccId => {
        if (chartofaccId) {
          this.isSpinning = true;
          this.getbyChartofAcc(chartofaccId)
        }
      });
    }

    else {
      this.getParty(this.partyname)
      this.voucherForm.get('partyId')?.valueChanges.subscribe(partyId => {
        if (partyId) {
          this.isSpinning = true;
          this.getbyparty(partyId)
        }
      });
    }

    this.getVoucherNumber(this.vouchermode);

    this.voucherForm.get('paidAmount')?.valueChanges.subscribe(paidAmount => {
      if (paidAmount) {
        this.isSpinning = true;
        this.payingAmount = paidAmount
        this.calculateSelectedTotal()
      }
      else {
        this.payingAmount = 0
        this.calculateSelectedTotal()
      }
    });
  }

  getRefVouchers(vouchergrp: any, partyId: any) {
    console.log(vouchergrp, partyId)
    this.voucherservice.getRefVoucherbychartofacc(vouchergrp, partyId).subscribe((res: APIResponse) => {
      if (res.data.length > 0) {
        this.refVoucher(res.data)
      }
      this.isSpinning = false;
    })
  }

  refVoucher(data: any) {
    const modal = this.modal.create({
      nzContent: RefVouchersComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzWidth: "700px",
      nzFooter: [],
      nzData: { data: data },
    })
    modal.afterClose.subscribe((result: any) => {
      if (result && result.data) {
        this.isRef = true;
        this.advanceAmount = result.data.amount
        this.refVoucherNumber = result.data.voucherNumber
        this.voucherForm.get('advanceAmount')?.setValue(this.advanceAmount)
      }
      else {
        this.notification.create('info', 'Info', 'No changes were made.')
      }
    });
  }

  getExpencessAcc(accType: any) {
    this.chartofaccservice.getChartofaccbyGrp(accType).subscribe((res: APIResponse) => {
      this.liabilityList = res.data;
    })
  }

  getbyChartofAcc(accName: any) {
    this.voucherservice.getbyChartofaccCondition(accName, { condition: true }).subscribe((res: APIResponse) => {
      this.voucherData = res.data.map((voucher: IVoucher) => ({
        ...voucher,
        amount: Number(voucher.amount),  // Ensure 'amount' is a number
        paidValue: Number(voucher.paidValue) // In case 'paidValue' is also received as string
      }));
    });
  }

  getVoucherNumber(name: any) {
    this.isSpinning = true;
    this.voucherservice.getVoucherNumber(name).subscribe((res: APIResponse) => {
      this.invoiceNumber = res.data
      this.isSpinning = false;
    })
  }

  getParty(partyname: any) {
    this.isSpinning = true;
    this.partyservice.getbygroup(partyname, true).subscribe((res: APIResponse) => {
      this.partyData = res.data;
      this.isSpinning = false;
    }, (error) => {
      // this.notification.create('error', 'Error', error.error?.message || 'Something went wrong!')
    })
  }

  getbyparty(partyname: any) {
    this.voucherservice.getbypartycondition(partyname, { condition: true }).subscribe((res: APIResponse) => {
      this.voucherData = res.data.map((voucher: IVoucher) => ({
        ...voucher,
        amount: Number(voucher.amount),  // Ensure 'amount' is a number
        paidValue: Number(voucher.paidValue) // In case 'paidValue' is also received as string
      }));
    });
  }

  checkout() {
    if (this.params !== "DirectPayment") {
      if (this.payingAmount <= 0) {
        this.notification.create('error', 'Error', 'Paid amount should not be 0');
        return;
      }
      if (this.selectedTotalAmount < this.payingAmount) {
        this.notification.create('error', 'Error', 'Paid amount should not be greater than total amount');
        return;
      }
    }
    this.params === 'Receipt' ? this.paymentMode('NOCREDIT', this.payingAmount, 'DEBIT') : this.paymentMode('NOCREDIT', this.payingAmount, 'CREDIT')
  }

  paymentMode(mode: string, amount: any, tranType: any) {
    if (this.voucherForm.invalid) {
      Object.values(this.voucherForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      })
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

  async submit(payments: any) {
    try {

      this.isSpinning = true;
      const coords = await this.getCurrentLocation();
      const location = `Latitude: ${coords.latitude}, Longitude: ${coords.longitude}`;

      // Add location to form data or process as needed
      this.voucherForm.get('location')?.setValue(location);
      var formData = this.voucherForm.value;

      const selectedVoucherIds = Array.from(this.setOfCheckedId).map(id => ({
        voucherId: id
      }));

      if (this.isRef === true) {
        payments = {
          ...payments,
          advance: this.advanceAmount
        }
      }

      console.log(payments)

      var buildData = {
        date: formData.date,
        voucherNumber: this.invoiceNumber,
        paidValue: this.isRef ? Number(this.advanceAmount) + Number(formData.paidAmount) : 0,
        note: formData.note,
        amount: this.isRef ? Number(this.advanceAmount) + Number(formData.paidAmount) : formData.paidAmount,
        location: formData.location,
        voucherGroupname: this.vouchermode,
        refVoucherNumber: this.refVoucherNumber || null,
        status: this.refVoucherNumber ? 'COMPLETED' : null,
        isRef: this.isRef,
        payment: payments,
        selectedVoucherIds: selectedVoucherIds
      }

      console.log(buildData)

      const data = this.params === "UtilityBillPayment"
        ? { ...buildData, chartofAccountId: formData.chartofaccId }
        : { ...buildData, partyId: formData.partyId };

      const journalEntries = this.generateJournalEntries(data, payments);

      this.voucherservice.create({ ...data, journalEntries }).subscribe((res: APIResponse) => {
        this.responseMessage = res.message
        this.isSpinning = false;
        this.resetForm();
        this.printoutSelection(res.data, this.params)
        this.notification.create('success', 'Success', this.responseMessage);
      }, (error) => {
        this.responseMessage = error.error?.message || 'Something went wrong!';
        this.isSpinning = false;
        this.notification.create('error', 'Error', this.responseMessage);
      })
    } catch (error) {
      this.isSpinning = false;
      this.notification.create('error', 'Error', 'Failed to get current location.');
    }
  }

  printoutSelection(data: any, type: any) {
    const modal = this.modal.create({
      nzContent: PdfSelectionComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzWidth: "700px",
      nzFooter: [],
      nzData: { data: data, type: type },
    })
    modal.afterClose.subscribe((result: any) => {
      if (result && result.data) {

      }
      else {
        this.notification.create('info', 'Info', 'No changes were made.')
      }
    });
  }

  generateJournalEntries(data: any, payments: any) {
    const journalEntries: any[] = [];
    const isDebit = this.params === "Receipt";
    const isCredit = !isDebit; // For Payment and UtilityBillPayment

    // Get the correct account ID to apply the opposite entry (debit or credit)
    const chartofaccId = data.chartofAccountId || this.getChartofAccIdFromParty(data.partyId);

    // Process cash payment
    if (payments.cash > 0) {
      journalEntries.push({
        accountId: "CASH", // Cash account
        debit: isCredit ? 0 : payments.cash * this.lkrAmount, // Debit for Receipt
        credit: isCredit ? payments.cash * this.lkrAmount: 0 // Credit for Payment or UtilityBillPayment
      });
    }

    // Process online transfer payment
    if (payments.onlineTransfer > 0 && payments.bankAccId) {
      journalEntries.push({
        accountId: payments.bankAccId, // Bank account for online transfer
        debit: isCredit ? 0 : payments.onlineTransfer * this.lkrAmount,
        credit: isCredit ? payments.onlineTransfer * this.lkrAmount: 0
      });
    }

    // Process cheque payment
    if (payments.cheque > 0) {
      journalEntries.push({
        accountId: "Check", // Bank account for cheque
        debit: isCredit ? 0 : payments.cheque ,
        credit: isCredit ? payments.cheque  * this.lkrAmount: 0
      });
    }

    // Add the opposite entry for the chartofaccId (e.g., party account)
    journalEntries.push({
      accountId: chartofaccId,
      debit: isCredit ? (this.isRef ? Number(data.amount) - Number(this.advanceAmount) : data.amount * this.lkrAmount) : 0, // Debit for Payment or UtilityBillPayment
      credit: isCredit ? 0 : (this.isRef ? Number(data.amount) - Number(this.advanceAmount) : data.amount * this.lkrAmount)
    });

    return journalEntries;
  }

  getChartofAccIdFromParty(partyId: string) {
    const party = this.partyData.find(p => p.id === partyId);
    return party?.chartofAccountId || null;
  }

  resetForm() {
    this.isSpinning = true;
    this.isRef = false;
    this.advanceAmount = 0;
    this.voucherData = [];
    this.voucherForm.reset();
    this.getVoucherNumber(this.vouchermode);
    this.totalAmount = 0;
    this.setOfCheckedId.clear;
  }

  onItemChecked(id: any, checked: boolean): void {
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
      const voucher = this.voucherData.find(v => v.id === id);
      return voucher ? total + (Number(this.vouchermode === 'PAYMENT' ? voucher.value : voucher.amount) - (Number(voucher.paidValue) + Number(voucher.returnValue))) : total;
    }, 0);

    this.voucherForm.get('totalAmount')?.setValue(this.selectedTotalAmount);
    this.voucherForm.get('dueBalance')?.setValue(this.isRef ? (Number(this.selectedTotalAmount) - Number(this.payingAmount)) - Number(this.advanceAmount) : Number(this.selectedTotalAmount) - Number(this.payingAmount) || 0);
  }

  onCurrentPageDataChange($event: readonly any[]): void {
    this.listOfCurrentPageData = $event;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.checked = this.listOfCurrentPageData.every(item => this.setOfCheckedId.has(item.id));
    this.indeterminate = this.listOfCurrentPageData.some(item => this.setOfCheckedId.has(item.id)) && !this.checked;
  }

  calculateDueAmount(amount: number, paidValue: number | null, returnValue: number | null): number {
    const paid = paidValue ?? 0;
    const returned = returnValue ?? 0;

    const dueAmount = Number(amount) - (Number(paid) + Number(returned));
    return dueAmount;
  }



  cancel(): void {
    this.nzMessageService.info('click cancel');
  }

  constructor(private nzMessageService: NzMessageService) { }

}