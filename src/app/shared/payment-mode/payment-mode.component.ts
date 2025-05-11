import { Component, inject, OnInit } from '@angular/core';
import { MaterialModule } from '../../modules/material/material.module';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NzModalRef, NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { PartyService } from '../../services/party/party.service';
import { APIResponse, IParty } from '../interface';
import { ChartofAccService } from '../../services/chartofAcc/chartof-acc.service';
import { ChequeService } from '../../services/cheque/cheque.service';

@Component({
  selector: 'app-payment-mode',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './payment-mode.component.html',
  styleUrl: './payment-mode.component.scss'
})
export class PaymentModeComponent implements OnInit {
  readonly #modal = inject(NzModalRef);
  readonly nzModalData: any = inject(NZ_MODAL_DATA);
  notification = inject(NzNotificationService);
  partyservice = inject(PartyService)
  chartofaccservice = inject(ChartofAccService)
  chequeservice = inject(ChequeService)

  mode = this.nzModalData?.mode;
  dataSource = this.nzModalData?.data;
  type = this.nzModalData?.type;
  tranType = this.nzModalData?.tranType;

  amount = this.nzModalData?.amount

  isSpinning = false;
  partyList: IParty[] = [];
  banklist: any[] = [];
  chequedetails: any = '';
  showBankList = false;
  chequeBankList = false;
  chequeBankName: any = '';
  chequeAmount: number = 0;

  paymentModeForm: FormGroup = new FormGroup({
    cash: new FormControl(''),
    onlineTransfer: new FormControl(0),
    cheque: new FormControl(0),
    credit: new FormControl(0),
    chartofAccountId: new FormControl(''),

    bankAccId: new FormControl(''),
    refNumber: new FormControl(''),

    chequebankAccId: new FormControl(''),
    chequenumber: new FormControl(''),
    releaseDate: new FormControl(''),
    chequeBankName: new FormControl('')
  })

  ngOnInit(): void {

    if (this.nzModalData?.amount) {
      this.paymentModeForm.get('credit')?.setValue(this.nzModalData?.amount);
    }
    this.paymentModeForm.get('onlineTransfer')?.valueChanges.subscribe(onlineTransfer => {
      if (onlineTransfer > 0) {
        this.showBankList = true;  // Show bank list when onlineTransfer > 0
        this.getbank();            // Fetch bank list
      } else {
        this.showBankList = false; // Hide bank list when onlineTransfer is 0 or less
      }
      this.recalculateAmounts();
    });

    this.paymentModeForm.get('cheque')?.valueChanges.subscribe(cheque => {
      if (cheque > 0) {
        this.chequeAmount = cheque
        this.chequeBankList = true;
        if (this.tranType === 'CREDIT') {
          this.getbank();
        }
      } else {
        this.chequeBankList = false; // Hide bank list when onlineTransfer is 0 or less
      }
      this.recalculateAmounts();
    });


    if (this.tranType === 'CREDIT') {
      this.paymentModeForm.get('chequebankAccId')?.valueChanges.subscribe(bankId => {
        if (bankId) {
          const selectedBank = this.banklist.find(bank => bank.id === bankId);
          if (selectedBank) {
            this.chequeBankName = selectedBank.accountName;
            this.getChequeNumber(bankId); // Fetch cheque number when bank is selected
          }
        }
      });
    } else {
      // Subscribe to the value changes of the chequeBankName dropdown
      this.paymentModeForm.get('chequeBankName')?.valueChanges.subscribe(selectedBankName => {
        this.chequeBankName = selectedBankName; // Store the selected bank name
      });

      // You can also immediately check if there is already a value in chequeBankName
      const selectedBankName = this.paymentModeForm.get('chequeBankName')?.value;
      if (selectedBankName) {
        this.chequeBankName = selectedBankName;
      }
    }

    // Listen to changes in the cash field
    this.paymentModeForm.get('cash')?.valueChanges.subscribe(cash => {
      const totalAmount = this.nzModalData?.amount;

      // Limit cash to totalAmount if it exceeds
      if (cash > totalAmount) {
        this.paymentModeForm.get('cash')?.setValue(totalAmount, { emitEvent: false });
        cash = totalAmount;
      }

      let remainingAmount = totalAmount - cash;

      // Distribute the remaining amount first to onlineTransfer, then cheque
      let onlineTransfer = this.paymentModeForm.get('onlineTransfer')?.value || 0;
      let cheque = this.paymentModeForm.get('cheque')?.value || 0;

      // Assign remaining amount to onlineTransfer first
      if (remainingAmount >= onlineTransfer) {
        remainingAmount -= onlineTransfer;
      } else {
        onlineTransfer = remainingAmount;
        remainingAmount = 0;
      }

      // Then to cheque
      if (remainingAmount >= cheque) {
        remainingAmount -= cheque;
      } else {
        cheque = remainingAmount;
        remainingAmount = 0;
      }

      // If mode is ALL, assign the remaining amount to credit
      if (this.mode === 'ALL') {
        const credit = remainingAmount;
        this.paymentModeForm.patchValue({
          onlineTransfer: onlineTransfer,
          cheque: cheque,
          credit: credit
        }, { emitEvent: false });
      } else {
        // If mode is NOCREDIT, just update onlineTransfer and cheque, and ensure credit is zero
        this.paymentModeForm.patchValue({
          onlineTransfer: onlineTransfer,
          cheque: cheque,
          credit: 0
        }, { emitEvent: false });
      }
    });

    // Adjust the form fields when other fields are changed
    ['onlineTransfer', 'cheque'].forEach(field => {
      this.paymentModeForm.get(field)?.valueChanges.subscribe(() => this.recalculateAmounts());
    });
  }

  getbank() {
    if (this.banklist.length === 0) {  // Check if the banklist is empty
      this.chartofaccservice.getChartofaccbyGrp('Bank').subscribe((res: APIResponse) => {
        this.banklist = res.data;
      }, (error) => {
        this.notification.error('Error', error.error.message);
      });
    }
  }

  getChequeNumber(bankId: any) {
    this.chequeservice.getbychequenumberBank(bankId).subscribe((res: APIResponse) => {
      this.chequedetails = res.data;
      this.paymentModeForm.get('chequenumber')?.setValue(this.chequedetails.nextNumber);
    }, (error) => {
      this.paymentModeForm.get('chequenumber')?.setValue('')
      this.notification.error('Error', error.error.message);
    });
  }
  // Recalculate remaining values when other fields are adjusted
  recalculateAmounts() {
    const totalAmount = this.nzModalData?.amount || 0;
    const cashValue = this.paymentModeForm.get('cash')?.value || 0;
    let remainingAmount = totalAmount - cashValue;

    let onlineTransfer = this.paymentModeForm.get('onlineTransfer')?.value || 0;
    let cheque = this.paymentModeForm.get('cheque')?.value || 0;

    // Recalculate onlineTransfer
    if (remainingAmount >= onlineTransfer) {
      remainingAmount -= onlineTransfer;
    } else {
      onlineTransfer = remainingAmount;
      remainingAmount = 0;
    }

    // Recalculate cheque
    if (remainingAmount >= cheque) {
      remainingAmount -= cheque;
    } else {
      cheque = remainingAmount;
      remainingAmount = 0;
    }

    // Finally assign remaining to credit if mode is ALL
    if (this.mode === 'ALL') {
      const credit = remainingAmount;
      this.paymentModeForm.patchValue({
        onlineTransfer: onlineTransfer,
        cheque: cheque,
        credit: credit
      }, { emitEvent: false });
    } else {
      this.paymentModeForm.patchValue({
        onlineTransfer: onlineTransfer,
        cheque: cheque,
        credit: 0
      }, { emitEvent: false });
    }
  }

  totalAmountValidator() {
    return (paymentModeForm: any) => {
      const totalAmount = this.nzModalData?.amount || 0;
      const sum = ['cash', 'onlineTransfer', 'cheque', 'credit']
        .map(field => paymentModeForm.get(field)?.value || 0)
        .reduce((acc, val) => acc + val, 0);

      return sum === totalAmount ? null : { totalMismatch: true };
    };
  }

  submit() {
    this.paymentModeForm.setValidators(this.totalAmountValidator());

    if (this.paymentModeForm.invalid) {
      Object.values(this.paymentModeForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      })
      return;
    }

    this.isSpinning = true;

    var formdata = this.paymentModeForm.value;

    var data = {
      cash: formdata.cash,
      onlineTransfer: formdata.onlineTransfer,
      cheque: formdata.cheque,
      credit: formdata.credit,
      bankAccId: formdata.bankAccId || null,
      refNumber: formdata.refNumber,
      chequebankAccId: formdata.chequebankAccId,
      chequeBookId: this.chequedetails.chequeBookId,
      chequenumber: formdata.chequenumber,
      chequeBankName: this.chequeBankName,
      releaseDate: formdata.releaseDate,
      creditDebit: this.tranType
    };
    this.#modal.destroy({ data: data });
  }

  destroyModal(): void {
    this.#modal.destroy({ data: 'Modal Closed' });
  }
}
