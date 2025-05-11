import { Component, inject, ViewContainerRef } from '@angular/core';
import { MaterialModule } from '../../../modules/material/material.module';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { JournallineService } from '../../../services/journalLine/journalline.service';
import { VoucherService } from '../../../services/voucher/voucher.service';
import { VoucherProductService } from '../../../services/voucherProduct/voucher-product.service';
import { IVoucher, APIResponse } from '../../../shared/interface';
import { PaymentModeComponent } from '../../../shared/payment-mode/payment-mode.component';

@Component({
  selector: 'app-approved-vouchers',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './approved-vouchers.component.html',
  styleUrl: './approved-vouchers.component.scss'
})
export class ApprovedVouchersComponent {
  isSpinning = true;
  searchControl: FormControl = new FormControl('');
  dateRange!: FormGroup;
  dataSource: IVoucher[] = [];
  filteredData: any[] = [];
  voucherProduct: any[] = [];

  modal = inject(NzModalService);
  viewContainerRef = inject(ViewContainerRef);
  notification = inject(NzNotificationService);
  voucherProductService = inject(VoucherProductService);
  journalLineService = inject(JournallineService);
  voucherService = inject(VoucherService);
  route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.getVoucher();
    this.setupSearch();
  }

  setupSearch() {
    this.searchControl.valueChanges.subscribe(() => {
      this.filterData();
    });
  }

  getVoucher() {
    this.voucherService.getApprovedVouchers().subscribe((res: APIResponse) => {
      this.dataSource = res.data;
      this.filteredData = res.data;
      this.isSpinning = false;
    });
  }

  filterData() {
    const searchTerm = this.searchControl.value.toLowerCase();
    this.filteredData = this.dataSource.filter((voucher: IVoucher) => {
      return voucher.voucherNumber.toLowerCase().includes(searchTerm);
    });
  }

  onValueChange(voucherProduct: any) {
    this.applyDiscount(voucherProduct);
    this.updateParentAmount();
  }

  applyDiscount(vp: any) {
    let amount = vp.MRP * vp.quantity; // Base amount before discount

    if (typeof vp.discount === 'string' && vp.discount.includes('%')) {
      // If discount is a percentage (e.g., '10%')
      const percentage = parseFloat(vp.discount.replace('%', ''));
      vp.amount = amount - (amount * (percentage / 100));
    } else {
      // Fixed amount discount
      const fixedDiscount = parseFloat(vp.discount) || 0;
      vp.amount = (vp.MRP - fixedDiscount) * vp.quantity;
      vp.amount = Math.max(0, vp.amount); // Ensure the amount is non-negative
    }
  }

  onExpandRow(data: any): void {
    if (data.expand) {
      this.voucherProductService.getbyGrp(data.id).subscribe((res: APIResponse) => {
        this.voucherProduct = res.data;
        this.voucherProduct.forEach((vp) => this.applyDiscount(vp)); // Initialize amounts
        this.updateParentAmount(); // Update the parent amount on expand
      });
    }
  }

  totalCost: number = 0; // Initialize totalCost
  totalAmount: number = 0; // Initialize totalCost

  updateParentAmount() {
    this.totalCost = 0
    this.totalAmount = 0
    this.dataSource.forEach((data) => {
      if (data.expand) {
        // Calculate the total amount of all products for the expanded row
        data.amount = this.voucherProduct.reduce((total, vp) => total + Number(vp.amount), 0);
        this.totalAmount = data.amount
      }
    });

    // Calculate total cost across all expanded rows (or globally if needed)
    this.totalCost = this.voucherProduct.reduce((total, vp) => total + (Number(vp.cost)) * (Number(vp.quantity)), 0);
  }

  updateConform(data: any): void {
    if (this.voucherProduct.length === 0) {
      this.notification.create('warning', 'Warning', 'Check List before conforming the voucher.');
      return;
    }

    const updatedVoucher = {
      ...data,
      voucherProduct: this.voucherProduct
    };

    const modal = this.modal.create({
      nzContent: PaymentModeComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzWidth: "700px",
      nzFooter: [],
      nzData: { amount: this.totalAmount, mode: 'ALL', tranType: 'DEBIT' },
    })
    modal.afterClose.subscribe((result: any) => {
      if (result && result.data) {
        let paidAmount = Number(result.data.cash) + Number(result.data.onlineTransfer) + Number(result.data.cheque)
        if (data.voucherNumber.startsWith('INV')) {
          const journalEntries = this.generateJournalEntries(updatedVoucher, result.data);
          data = {
            ...updatedVoucher,
            journalEntries,
            isPayment: true,
            isconform: true,
            paidValue: paidAmount,
            firstPay: paidAmount,
            stockStatus: true,
            status: 'COMPLETED',
            payment: result.data
          }
        }

        this.voucherService.updatePending(data.id, data).subscribe((res: APIResponse) => {
          data = res.data;
          console.log('Updating Voucher Data:', data);
          this.filteredData = this.filteredData.filter((voucher: any) => voucher.id !== data.id);
          this.dataSource = this.dataSource.filter((voucher: any) => voucher.id !== data.id);
          this.notification.create('success', 'Success', 'Voucher updated successfully.');
        }, (error) => {
          this.notification.create('error', 'Error', error.error.message);
        })
      }
      else {
        this.notification.create('info', 'Info', 'No changes were made.')
      }
    });
  }

  generateJournalEntries(data: any, payments: any) {
    const journalEntries: any[] = [];
    const isDebit = data.voucherNumber.startsWith('INV');
    const isCredit = !isDebit; // ForSales retrun

    // Get the correct account ID to apply the opposite entry (debit or credit)
    const chartofaccId = data.party.chartofAccountId;

    // Process cash payment
    if (payments.cash > 0) {
      journalEntries.push({
        accountId: "CASH", // Cash account
        debit: isCredit ? 0 : payments.cash, // Debit for Receipt
        credit: isCredit ? payments.cash : 0 // Credit for Payment or UtilityBillPayment
      });
      journalEntries.push({
        accountId: chartofaccId, // Cash account
        debit: payments.cash, // Debit for Receipt
        credit: 0 // Credit for Payment or UtilityBillPayment
      });
      journalEntries.push({
        accountId: chartofaccId, // Cash account
        debit: 0, // Debit for Receipt
        credit: payments.cash // Credit for Payment or UtilityBillPayment
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
    if (payments.credit > 0) {
      journalEntries.push({
        accountId: chartofaccId,
        debit: isCredit ? 0 : payments.credit,
        credit: isCredit ? payments.credit : 0
      });
    }

    journalEntries.push({
      accountId: 'Sales',
      debit: isCredit ? data.amount : 0,
      credit: isCredit ? 0 : data.amount
    });

    journalEntries.push({
      accountId: 'INVENTORY',
      debit: isCredit ? this.totalCost : 0,
      credit: isCredit ? 0 : this.totalCost
    });

    journalEntries.push({
      accountId: 'COST',
      debit: isCredit ? 0 : this.totalCost,
      credit: isCredit ? this.totalCost : 0
    });

    return journalEntries;
  }



  cancel(): void {
    this.nzMessageService.info('click cancel');
  }

  constructor(private nzMessageService: NzMessageService) { }
}
