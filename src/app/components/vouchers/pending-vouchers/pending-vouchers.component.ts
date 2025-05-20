import { Component, inject, ViewContainerRef } from '@angular/core';
import { MaterialModule } from '../../../modules/material/material.module';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { JournallineService } from '../../../services/journalLine/journalline.service';
import { VoucherService } from '../../../services/voucher/voucher.service';
import { VoucherProductService } from '../../../services/voucherProduct/voucher-product.service';
import { IVoucher, APIResponse } from '../../../shared/interface';
import { ReportSelectionComponent } from '../transaction/report-selection/report-selection/report-selection.component';
import { PaymentModeComponent } from '../../../shared/payment-mode/payment-mode.component';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-pending-vouchers',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './pending-vouchers.component.html',
  styleUrl: './pending-vouchers.component.scss'
})
export class PendingVouchersComponent {
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

  currentPage = 1;
  pageSize = 100;

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  setupSearch() {
    this.searchControl.valueChanges.subscribe(() => {
      this.filterData();
    });
  }

  getVoucher() {
    this.voucherService.getPendingVouchers().subscribe((res: APIResponse) => {
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

  getDiscountRate(discount: string | number, MRP: number): number {
    if (discount === '' || discount === null || discount === undefined) {
      return MRP;
    }
    if (typeof discount === 'string' && discount.includes('%')) {
      const discountValue = parseFloat(discount.replace('%', ''));
      return MRP - (MRP * (discountValue / 100)); // MRP - percentage discount
    }
    // If discount is a number or string without '%', treat it as a fixed discount
    const fixedDiscount = typeof discount === 'number' ? discount : parseFloat(discount);
    return MRP - fixedDiscount; // Subtract fixed discount from MRP
  }

  getrate(product: any, type: string): any {
    if (type === 'COST') {
      const rate = this.getDiscountRate(product.discount, product.MRP);
      return (((rate - product.cost) / product.cost) * 100).toFixed(2);
    }
    else {
      const rate = this.getDiscountRate(product.discount, product.MRP);
      return (((rate - product.cost) / rate) * 100).toFixed(2);
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
      stockStatus: data.voucherNumber.startsWith('INV'),
      isconform: data.voucherNumber.startsWith('INV'),
      status: data.voucherNumber.startsWith('SC') ? 'PAYMENT PENDING' : 'COMPLETED',
      voucherProduct: this.voucherProduct,
      journalEntries: data.voucherNumber.startsWith('INV') ? null : [
        {
          accountId: data.party.chartofAccountId,
          debit: 0,
          credit: data.amount,
        },
        {
          accountId: 'Sales',
          debit: data.amount,
          credit: 0
        },
        {
          accountId: 'INVENTORY',
          debit: this.totalCost,
          credit: 0
        },
        {
          accountId: 'COST',
          debit: 0,
          credit: this.totalCost
        }
      ],
    };

    console.log(updatedVoucher)

    this.voucherService.updatePending(data.id, updatedVoucher).subscribe((res: APIResponse) => {
      data = res.data;
      this.filteredData = this.filteredData.filter((voucher: any) => voucher.id !== data.id);
      this.dataSource = this.dataSource.filter((voucher: any) => voucher.id !== data.id);
      this.notification.create('success', 'Success', 'Voucher updated successfully.');
      this.voucherProduct = [];
    }, (error) => {
      this.notification.create('error', 'Error', error.error.message);
    })

  }

  voucherCancel(id: any) {
    const data = {
      voucherGrpName: id.voucherNumber.startsWith('INV') ? 'Invoice' : 'Sales Return',
      status: 'CANCELLED'
    };

    this.voucherService.updateCancel(id.id, data).subscribe((res: APIResponse) => {
      this.notification.create('success', 'Success', res.message)
      this.filteredData = this.filteredData.filter((voucher: any) => voucher.id !== id.id);
      this.dataSource = this.dataSource.filter((voucher: any) => voucher.id !== id.id);
    });
  }

  cancel(): void {
    this.nzMessageService.info('click cancel');
  }

  constructor(private nzMessageService: NzMessageService) { }

}
