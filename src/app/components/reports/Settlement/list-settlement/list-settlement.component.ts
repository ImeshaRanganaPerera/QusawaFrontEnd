import { Component, inject, ViewContainerRef, OnInit } from '@angular/core';
import { InvoicePdfComponent } from '../../../../shared/invoice-pdf/invoice-pdf.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { VoucherService } from '../../../../services/voucher/voucher.service';
import { IVoucher, APIResponse } from '../../../../shared/interface';
import { ReportSelectionComponent } from '../../../vouchers/transaction/report-selection/report-selection/report-selection.component';
import { VoucherProductService } from '../../../../services/voucherProduct/voucher-product.service';
import { ActivatedRoute } from '@angular/router';
import { ReceiptVoucherComponent } from '../../../../shared/receipt-voucher/receipt-voucher.component';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { MaterialModule } from '../../../../modules/material/material.module';
import { GetPaymentAmountPipe } from '../../../../shared/pipes/get-payment-amount.pipe';
import { reduce } from 'rxjs';

@Component({
  selector: 'app-list-settlement',
  standalone: true,
  imports: [MaterialModule, GetPaymentAmountPipe],
  templateUrl: './list-settlement.component.html',
  styleUrl: './list-settlement.component.scss'
})
export class ListSettlementComponent {
  isSpinning = false;
  isSpinning2 = false;
  searchControl: FormControl = new FormControl('');
  dateRange!: FormGroup;
  dataSource: any[] = [];
  filteredData: any[] = [];
  voucherProduct: any[] = [];
  reportDate!: string;

  totalCash: number = 0;
  onlineTransfer: number = 0;
  cheque: number = 0;
  credit: number = 0;
  visa: number = 0;
  mastercard: number = 0;
  amex: number = 0;
  totalAmount: number = 0;

  modal = inject(NzModalService);
  viewContainerRef = inject(ViewContainerRef);
  notification = inject(NzNotificationService);
  voucherProductService = inject(VoucherProductService);
  voucherService = inject(VoucherService);
  route = inject(ActivatedRoute);

  currentPage = 1;
  pageSize = 100;

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  ngOnInit(): void {
    this.setupSearch();
    this.setupDateRange();
    this.voucherGrp = `INVOICE`;
    this.getvoucher(this.voucherGrp);
    this.type = 'INVOICE';
  }

  date: any = null;

  onChange(result: Date[]): void {
    this.date = result;
    console.log('onChange: ', result);
  }

  setupSearch() {
    this.searchControl.valueChanges.subscribe((searchTerm) => {
      this.filterData();
      this.calculatePaymentAmount();
    });
  }

  getVoucher(grpname: any) {
    this.isSpinning = true;
    this.voucherService.getbyGrp(grpname).subscribe(
      (res: APIResponse) => {
        this.dataSource = res.data;
        this.pageSize = this.dataSource.length
        this.filterData();
        this.isSpinning = false;
        this.calculatePaymentAmount();
      },
      (error) => {
        this.isSpinning = false;
        this.notification.create('error', 'Error', error.error?.message || 'Something went wrong!');
      }
    );
  }

  filterData() {
    const searchTerm = this.searchControl.value.toLowerCase();
    this.filteredData = this.dataSource.filter((voucher: IVoucher) => {
      return voucher.voucherNumber.toLowerCase().includes(searchTerm);
    });
  }

  startDate: any = null;
  endDate: any = null;

  getvoucher(voucherGrp: any, startDate?: any, endDate?: any) {
    console.log(voucherGrp)
    this.voucherService.getFilteredVouchers(voucherGrp, startDate, endDate).subscribe((res: APIResponse) => {
      this.dataSource = res.data;
      this.pageSize = this.dataSource.length
      console.log(this.dataSource)
      this.filterData();
      this.calculatePaymentAmount();
      this.isSpinning = false;
    }, (error) => {
      this.isSpinning = false;
    })
  }

  applyDateFilter() {
    this.isSpinning = true
    console.log(this.date);
    const startDate = this.date[0];
    const endDate = this.date[1];

    if (!startDate || !endDate) {
      this.notification.create('warning', 'Date Range Required', 'Please select both start and end dates.');
      return;
    }
    this.getvoucher(this.voucherGrp, startDate, endDate)
  }

  calculatePaymentAmount() {
    this.totalCash = this.filteredData.reduce((acc, cur) => {
      return acc + cur.PaymentVoucher.reduce((sum: any, payment: any) => {
        return payment.paymentType === "Cash" ? sum + Number(payment.amount) : sum;
      }, 0);
    }, 0);

    this.onlineTransfer = this.filteredData.reduce((acc, cur) => {
      return acc + cur.PaymentVoucher.reduce((sum: any, payment: any) => {
        return payment.paymentType === "Online Transfer" ? sum + Number(payment.amount) : sum;
      }, 0);
    }, 0);

    this.cheque = this.filteredData.reduce((acc, cur) => {
      return acc + cur.PaymentVoucher.reduce((sum: any, payment: any) => {
        return payment.paymentType === "Cheque" ? sum + Number(payment.amount) : sum;
      }, 0);
    }, 0);

    this.credit = this.filteredData.reduce((acc, cur) => {
      return acc + cur.PaymentVoucher.reduce((sum: any, payment: any) => {
        return payment.paymentType === "Credit" ? sum + Number(payment.amount) : sum;
      }, 0);
    }, 0);

    this.visa = this.filteredData.reduce((acc, cur) => {
      return acc + cur.PaymentVoucher.reduce((sum: any, payment: any) => {
        return payment.paymentType === "Visa" ? sum + Number(payment.amount) : sum;
      }, 0);
    }, 0);

    this.mastercard = this.filteredData.reduce((acc, cur) => {
      return acc + cur.PaymentVoucher.reduce((sum: any, payment: any) => {
        return payment.paymentType === "Mastercard" ? sum + Number(payment.amount) : sum;
      }, 0);
    }, 0);

    this.amex = this.filteredData.reduce((acc, cur) => {
      return acc + cur.PaymentVoucher.reduce((sum: any, payment: any) => {
        return payment.paymentType === "Amex" ? sum + Number(payment.amount) : sum;
      }, 0);
    }, 0);

    this.totalAmount = this.filteredData.reduce((acc, cur) => {
      return acc + Number(cur.amount);
    },0)
  }

  reportSelection() {
    const modal = this.modal.create({
      nzContent: ReportSelectionComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzWidth: "900px",
      nzFooter: [],
      nzMaskClosable: false,
      nzClosable: false,
      nzData: {
        Data: this.filteredData,
        voucherGrp: this.voucherGrp,
        type: this.type,
        category: this.category
      }
    });
  }

  setupDateRange() {
    this.dateRange = new FormGroup({
      start: new FormControl(),
      end: new FormControl()
    });
  }

  title: string = '';
  voucherNumber: string = '';
  type: any;
  voucherGrp: any;
  category: any;

  fetchReportData() {
    this.isSpinning = true;
    // Adjust this to use your actual service method
    this.voucherService.getReportData().subscribe(
      (res: APIResponse) => {
        this.dataSource, this.filteredData = res.data;
        this.isSpinning = false;
      },
      (error) => {
        console.error('Error fetching report data:', error);
        this.isSpinning = false;
      }
    );
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

  getAmount(product: any): number {
    if (this.category === 'Inventory') {
      const rate = this.getDiscountRate(product.discount, product.cost);
      return rate * product.quantity; // Calculate total amount with the adjusted rate
    }
    else {
      const rate = this.getDiscountRate(product.discount, product.MRP);
      return rate * product.quantity; // Calculate total amount with the adjusted rate
    }
  }


  onExpandRow(data: any): void {
    this.isSpinning2 = true;
    this.voucherProduct = [];

    if (data.expand) {
      this.voucherProductService.getbyGrp(data.id).subscribe((res: APIResponse) => {
        this.voucherProduct = res.data;
        this.isSpinning2 = false;
      })
    }
  }

  pdfDownload(data: any) {
    const modal = this.modal.create({
      nzContent: InvoicePdfComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzWidth: "900px",
      nzFooter: [],
      nzData: { data: data.id, type: this.type },
    })
    modal.afterClose.subscribe((result: any) => {
    });
  }
}
