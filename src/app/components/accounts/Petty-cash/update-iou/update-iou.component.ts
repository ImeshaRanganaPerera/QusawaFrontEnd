import { Component, inject, OnInit } from '@angular/core';
import { MaterialModule } from '../../../../modules/material/material.module';
import { NzModalRef, NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { APIResponse } from '../../../../shared/interface';
import { Observable } from 'rxjs/internal/Observable';
import { PettyCashService } from '../../../../services/pettyCash/petty-cash.service';

@Component({
  selector: 'app-update-iou',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './update-iou.component.html',
  styleUrl: './update-iou.component.scss'
})
export class UpdateIouComponent implements OnInit {

  isSpinning: boolean = false;

  readonly #modal = inject(NzModalRef);
  notification = inject(NzNotificationService);
  pettyCashService = inject(PettyCashService)
  nowdate = new Date();
  responseMessage: any;

  readonly nzModalData: any = inject(NZ_MODAL_DATA);
  action = this.nzModalData?.action;
  maxAmount = this.nzModalData?.data.amount || 0;
  isReturn = this.nzModalData?.data.isReturn

  listOfData: any[] = [{ id: `${0}`, refnumber: '', description: '', amount: '' }];
  totalSpent: number = 0;
  balance: number = 0;
  checked = this.isReturn;

  ngOnInit(): void {
    if (this.nzModalData?.data.pettyCashIOUDetails) {
      console.log(this.nzModalData?.data.pettyCashIOUDetails)
      // Populate listOfData from pettyCashIOUDetails
      this.listOfData = this.nzModalData.data.pettyCashIOUDetails.map((detail: any) => ({
        id: detail.id || `${0}`, // Ensure there's an id
        refnumber: detail.refnumber,
        description: detail.description,
        amount: detail.amount
      }));
    } else {
      // Initialize with a default row if no data
      this.listOfData = [{ id: `${0}`, refnumber: '', description: '', amount: '' }];
    }
    this.calculateTotals(); // Recalculate totals after setting listOfData
  }

  addRow(): void {
    this.listOfData = [
      ...this.listOfData,
      { id: `${0}`, refnumber: '', description: '', amount: '' }
    ];
  }

  // Remove a row from both form and listOfData
  deleteRow(id: number): void {
    this.listOfData = this.listOfData.filter(d => d.id !== id);
    this.calculateTotals();
  }

  // Handle amount changes in the form
  onAmountChange(row: any): void {

    this.calculateTotals();
  }

  // Calculate total spent and remaining balance
  calculateTotals(): void {
    this.totalSpent = this.listOfData.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    this.balance = this.maxAmount - this.totalSpent; // Calculate balance
  }

  checkbutton() {
    this.checked = !this.checked
  }

  submit() {
    if (this.totalSpent > this.maxAmount) {
      this.notification.create('error', 'Error', 'Total spent amount exceeds the available balance.');
      return; // Stop the submission process
    }
    this.isSpinning = true;

    const pettyCashIOUDetails = this.listOfData.map(row => ({
      refnumber: row.refnumber,
      description: row.description,
      amount: row.amount
    }));
    console.log(pettyCashIOUDetails)

    var data = {
      spent: this.totalSpent,
      returnDate: null,
      returnAmount: this.balance,
      isReturn: this.checked,
      pettyCashIOUDetails,
      journalEntries: this.checked ? [{
        accountId: 'PettyCash',
        debit: this.balance,
        credit: 0,
      }, {
        accountId: 'UserExp',
        debit: 0,
        credit: this.balance,
      }] : null
    }
    console.log(data)
    this.isSpinning = true;
    this.action === "Create" ? this.handleSubmit(this.pettyCashService.create(data))
      : this.handleSubmit(this.pettyCashService.updateIOU(this.nzModalData?.data?.id, data));
  }

  handleSubmit(observable$: Observable<APIResponse>) {
    observable$.subscribe((res: APIResponse) => {
      this.responseMessage = res.message;
      this.isSpinning = false;
      this.#modal.destroy({ message: this.responseMessage, });
    }, (error) => {
      this.responseMessage = error.error?.message || 'Something went Wrong!'
      this.isSpinning = false;
      this.notification.create('error', 'Error', this.responseMessage)
    })
  }

  destroyModal(): void {
    this.#modal.destroy({ message: 'Modal Closed' });
  }
}
