import { Component, inject, Input, OnInit } from '@angular/core';
import { MaterialModule } from '../../../../modules/material/material.module';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { APIResponse } from '../../../../shared/interface';
import { Observable } from 'rxjs/internal/Observable';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ChartofAccService } from '../../../../services/chartofAcc/chartof-acc.service';
import { VoucherService } from '../../../../services/voucher/voucher.service';
import { UserService } from '../../../../services/user/user.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-manage-petty-cash',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './manage-petty-cash.component.html',
  styleUrl: './manage-petty-cash.component.scss'
})
export class ManagePettyCashComponent implements OnInit {

  readonly #modal = inject(NzModalRef);
  readonly nzModalData: any = inject(NZ_MODAL_DATA);
  notification = inject(NzNotificationService);
  chartofaccservice = inject(ChartofAccService)
  voucherservice = inject(VoucherService)
  userService = inject(UserService)
  nowdate = new Date();

  action = this.nzModalData?.action;
  balance = this.nzModalData?.amount;
  mode = this.nzModalData?.mode;

  selectedAccountName: string | undefined;

  amount: any;

  isSpinning = false;
  responseMessage: any;
  vouchergrp: any;
  ref: any;
  expencessList: any[] = [];
  userList: any[] = [];
  voucherNumber: any;
  userName: any;
  

  pettyCashForm: FormGroup = new FormGroup({

    chartofaccId: new FormControl(''),
    userId: new FormControl(''),
    amount: new FormControl('', [Validators.required]),
    location: new FormControl(''),
    date: new FormControl('', [Validators.required]),
    note: new FormControl(''),
  })

  ngOnInit(): void {
    if (this.mode === 'Petty Cash') {
      this.vouchergrp = 'PETTY-CASH';
      this.ref = "Petty Cash Exp";
      this.getExpencess()
      this.getVoucherNumber(this.vouchergrp)
      this.onChartofaccIdChange();

      this.pettyCashForm.get('chartofaccId')?.setValidators([Validators.required]);
      this.pettyCashForm.get('chartofaccId')?.updateValueAndValidity();
    }
    else {
      this.vouchergrp = 'PETTY-CASH-IOU';
      this.ref = "Petty Cash IOU";
      this.getUsers()
      this.getVoucherNumber(this.vouchergrp)
    }
  }

  onChartofaccIdChange() {
    this.pettyCashForm.get('chartofaccId')?.valueChanges.subscribe(selectedId => {
      const selectedAccount = this.expencessList.find(acc => acc.id === selectedId);
      this.selectedAccountName = selectedAccount ? selectedAccount.accountName : undefined;
    });
  }

  getVoucherNumber(vouchertype: any) {
    this.voucherservice.getVoucherNumber(vouchertype).subscribe((res: APIResponse) => {
      this.voucherNumber = res.data;
      this.isSpinning = false;
    })
  }

  getExpencess() {
    this.chartofaccservice.getChartofaccbyGrp('Expenses').subscribe((res: APIResponse) => {
      this.expencessList = res.data;
      this.isSpinning = false;
    })
  }

  getUsers() {
    this.userService.get().subscribe((res: APIResponse) => {
      this.userList = res.data;
      console.log(this.userList)
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

  async submit() {
    if (this.pettyCashForm.invalid) {
      Object.values(this.pettyCashForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      })
      return;
    }

    if (this.vouchergrp === 'PETTY-CASH-IOU') {
      const userId = this.pettyCashForm.get('userId')?.value;
      const user = this.userList.find(user => user.id === userId);
      this.userName = user ? user.name : 'Unknown User'; // Replace 'name' with the appropriate property if different
    }

    this.isSpinning = true;
    const coords = await this.getCurrentLocation();
    const location = `Latitude: ${coords.latitude}, Longitude: ${coords.longitude}`;
    this.pettyCashForm.get('location')?.setValue(location);

    var formData = this.pettyCashForm.value;
    this.amount = formData.amount;

    if (this.balance < formData.amount) {
      this.notification.create('error', 'Error', 'Amount Should be above to petty cash balance');
      this.isSpinning = false;
      return;
    }
    var data;

    if (this.mode === 'Petty Cash') {
      data = {
        date: formData.date,
        voucherNumber: this.voucherNumber,
        chartofAccountId: this.mode === 'Petty Cash' ? formData.chartofaccId : null,
        paidValue: 0,
        amount: formData.amount,
        location: formData.location,
        voucherGroupname: this.vouchergrp,
        journalEntries: [
          {
            accountId: this.mode === 'Petty Cash' ? formData.chartofaccId : 'UserExp',
            debit: formData.amount,
            credit: 0,
            ref: formData.note
          },
          {
            accountId: 'PettyCash',
            debit: 0,
            credit: formData.amount,
            ref: formData.note
          }
        ],
      }
    }
    else {
      data = {
        date: this.nowdate,
        voucherNumber: this.voucherNumber,
        chartofAccountId: this.mode === 'Petty Cash' ? formData.chartofaccId : null,
        paidValue: 0,
        amount: formData.amount,
        location: formData.location,
        voucherGroupname: this.vouchergrp,
        journalEntries: [
          {
            accountId: this.mode === 'Petty Cash' ? formData.chartofaccId : 'UserExp',
            debit: formData.amount,
            credit: 0,
            ref: this.ref
          },
          {
            accountId: 'PettyCash',
            debit: 0,
            credit: formData.amount,
            ref: "Petty Cash"
          }
        ],
        iou: [
          {
            userid: formData.userId,
            amount: formData.amount,
          }
        ]
      }
    }

    console.log(data)
    // console.log(updatedFormValue)
    this.isSpinning = true;
    this.action === "Create" ? this.handleSubmit(this.voucherservice.create(data))
      : this.handleSubmit(this.voucherservice.update(this.nzModalData?.data?.id, data));
  }

  handleSubmit(observable$: Observable<APIResponse>) {
    observable$.subscribe((res: APIResponse) => {
      this.responseMessage = res.message;
      this.isSpinning = false;
      this.#modal.destroy({
        message: this.responseMessage,
        data: this.vouchergrp === 'PETTY-CASH-IOU' ? res.data : {
          debitAmount: this.amount,
          amount: this.amount,
          user: { username: this.userName },
          account:
          {
            accountName: this.selectedAccountName,
          },
        }
      });
    }, (error) => {
      this.responseMessage = error.error?.message || 'Something went Wrong!'
      this.isSpinning = false;
      this.notification.create('error', 'Error', this.responseMessage)
    })
  }

  destroyModal(): void {
    this.#modal.destroy({ message: 'Modal Closed' });
  }

  cancel(): void {
    this.nzMessageService.info('click cancel');
  }

  constructor(private nzMessageService: NzMessageService) { }

}
