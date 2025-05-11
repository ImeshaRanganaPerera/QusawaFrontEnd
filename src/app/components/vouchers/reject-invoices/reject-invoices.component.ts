import { Component, inject, ViewContainerRef } from '@angular/core';
import { MaterialModule } from '../../../modules/material/material.module';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { JournallineService } from '../../../services/journalLine/journalline.service';
import { ReferVoucherService } from '../../../services/referVoucher/refer-voucher.service';
import { VoucherService } from '../../../services/voucher/voucher.service';
import { VoucherProductService } from '../../../services/voucherProduct/voucher-product.service';
import { IVoucher, APIResponse } from '../../../shared/interface';
import { InvoicePdfComponent } from '../../../shared/invoice-pdf/invoice-pdf.component';
import { ReceiptVoucherComponent } from '../../../shared/receipt-voucher/receipt-voucher.component';
import { ReportSelectionComponent } from '../transaction/report-selection/report-selection/report-selection.component';

@Component({
  selector: 'app-reject-invoices',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './reject-invoices.component.html',
  styleUrl: './reject-invoices.component.scss'
})
export class RejectInvoicesComponent {
  isSpinning = false;
  isSpinning2 = false;
  searchControl: FormControl = new FormControl('');
  dateRange!: FormGroup;
  dataSource: IVoucher[] = [];
  filteredData: any[] = [];
  voucherProduct: any[] = [];
  referVoucher: any[] = [];
  journalLines: any[] = [];
  status: any = undefined;
  role: any;
  totalAmount: number = 0;

  modal = inject(NzModalService);
  viewContainerRef = inject(ViewContainerRef);
  notification = inject(NzNotificationService);
  voucherProductService = inject(VoucherProductService);
  journalLineService = inject(JournallineService);
  voucherService = inject(VoucherService);
  referVoucherService = inject(ReferVoucherService);
  route = inject(ActivatedRoute);

  currentPage = 1;
  pageSize = 100;

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  ngOnInit(): void {
    this.totalAmount = 0;
    this.getRole();
    this.setupSearch();
    this.setupDateRange();
    this.getvoucher();
  }

  getRole() {
    this.role = localStorage.getItem('role')
  }

  date: any = null;

  onChange(result: Date[]): void {
    this.date = result;
  }

  setupSearch() {
    this.searchControl.valueChanges.subscribe((searchTerm) => {
      this.filterData();
    });
  }

  getVoucher(grpname: any) {
    this.totalAmount = 0;
    this.isSpinning = true;

    this.voucherService.getbyGrp(grpname).subscribe(
      (res: APIResponse) => {
        this.dataSource = res.data;
        this.filterData();
        this.isSpinning = false;
        this.calculateAmount()
        console.log(this.dataSource)
      },
      (error) => {
        this.isSpinning = false;
        this.notification.create('error', 'Error', error.error?.message || 'Something went wrong!');
      }
    );
  }

  filterData() {
    const searchTerm = this.searchControl.value.toLowerCase();
    this.filteredData = this.dataSource.filter((voucher: any) => {
      const partyName = voucher.party?.name ? voucher.party.name.toLowerCase() : '';
      const userName = voucher.user?.name ? voucher.user.name.toLowerCase() : '';
      const voucherNumber = voucher.voucherNumber.toLowerCase();
      return partyName.includes(searchTerm) || voucherNumber.includes(searchTerm) || userName.includes(searchTerm);
    });
  }

  startDate: any = null;
  endDate: any = null;

  getvoucher(startDate?: any, endDate?: any) {
    this.totalAmount = 0;
    this.dataSource = [];
    this.filteredData = [];
    this.journalLines = [];
    this.voucherProduct = [];
    this.referVoucher = [];
    this.voucherService.getRejectInvoices(startDate, endDate).subscribe((res: APIResponse) => {
      this.dataSource = res.data;
      console.log(this.dataSource)
      this.filterData();
      this.calculateAmount()
      this.isSpinning = false;
    }, (error) => {
      this.isSpinning = false;
    })
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

  getvoucherByStatus(voucherGrp: any, status: any) {
    this.totalAmount = 0;
    this.dataSource = [];
    this.filteredData = [];
    this.journalLines = [];
    this.voucherProduct = [];
    this.referVoucher = [];
    this.voucherService.getFilteredVouchersByStatus(voucherGrp, status).subscribe((res: APIResponse) => {
      this.dataSource = res.data;
      console.log(this.dataSource)
      this.filterData();
      this.calculateAmount();
      this.isSpinning = false;
    }, (error) => {
      this.isSpinning = false;
    })
  }

  voucherCancel(id: any) {
    const data = {
      voucherGrpName: this.voucherGrp,
      status: 'CANCELLED'
    };

    this.voucherService.updateCancel(id.id, data).subscribe((res: APIResponse) => {
      // Update the status to 'CANCELLED' in dataSource
      this.notification.create('success', 'Success', res.message)
      this.dataSource = this.dataSource.map((voucher: any) => {
        if (voucher.id === id.id) {
          return { ...voucher, status: 'CANCELLED' };
        }
        return voucher;
      });

      // Update the status to 'CANCELLED' in filteredData
      this.filteredData = this.filteredData.map((voucher: any) => {
        if (voucher.id === id.id) {
          return { ...voucher, status: 'CANCELLED' };
        }
        return voucher;
      });
    });
  }

  applyDateFilter() {
    this.totalAmount = 0;
    this.dataSource = [];
    this.filteredData = [];
    this.journalLines = [];
    this.voucherProduct = [];
    this.referVoucher = [];
    console.log(this.voucherGrp)
    if (this.voucherGrp === 'SALES-ORDER') {
      this.isSpinning = true
      if (this.status !== undefined || '') {
        this.getvoucherByStatus(this.voucherGrp, this.status)
      }
      else {
        const startDate = this.date[0];
        const endDate = this.date[1];

        if (!startDate || !endDate) {
          this.notification.create('warning', 'Date Range Required', 'Please select both start and end dates.');
          return;
        }
        this.getvoucher(startDate, endDate)
      }
    }
    else {
      this.isSpinning = true
      const startDate = this.date[0];
      const endDate = this.date[1];

      if (!startDate || !endDate) {
        this.notification.create('warning', 'Date Range Required', 'Please select both start and end dates.');
        return;
      }
      this.getvoucher(startDate, endDate)
    }
  }

  calculateAmount() {
    this.totalAmount = this.filteredData.reduce((acc, cur) => {
      return acc + Number(cur.amount);
    }, 0)
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

  onExpandRow(data: any): void {
    this.isSpinning2 = true;
    this.voucherProduct = [];
    this.referVoucher = [];
    this.journalLines = [];

    if (data.expand) {
      if (this.type === 'Payment' || this.type === 'Receipt') {
        this.referVoucherService.getReferVouchers(data.id).subscribe((res: APIResponse) => {
          this.referVoucher = res.data;
          console.log(this.referVoucher)
        })
      }
      else if (this.type === "Journal Entry" || this.type === "Make Deposit") {
        this.journalLineService.getbyId(data.id).subscribe((res: APIResponse) => {
          this.journalLines = res.data;
          console.log(this.journalLines)
        })
      }
      else {
        this.voucherProductService.getbyGrp(data.id).subscribe((res: APIResponse) => {
          this.voucherProduct = res.data;
          console.log(this.voucherProduct)
          this.isSpinning2 = false;
        })
      }
    }
  }

  pdfDownload(data: any) {
    console.log(this.type)
    if (this.category === 'Account') {
      const modal = this.modal.create({
        nzContent: ReceiptVoucherComponent,
        nzViewContainerRef: this.viewContainerRef,
        nzWidth: "900px",
        nzFooter: [],
        nzData: { data: data.id, type: this.type },
      })
      modal.afterClose.subscribe((result: any) => {
      });
    }
    if (this.type === 'Sales Return' || this.type === 'Invoice' || this.type === 'Sales Order' || this.type === 'GRN' || this.type === 'Stock Transfer') {
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

  cancel(): void {
    this.nzMessageService.info('click cancel');
  }

  constructor(private nzMessageService: NzMessageService) { }
}
