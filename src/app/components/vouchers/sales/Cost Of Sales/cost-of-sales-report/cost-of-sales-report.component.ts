import { Component, inject, ViewContainerRef, OnInit } from '@angular/core';
import { InvoicePdfComponent } from '../../../../../shared/invoice-pdf/invoice-pdf.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
// import { VoucherService } from '../../../../services/voucher/voucher.service';
import { IVoucher, APIResponse } from '../../../../../shared/interface';
import { ReportSelectionComponent } from '../../../../vouchers/transaction/report-selection/report-selection/report-selection.component';
// import { VoucherProductService } from '../../../../services/voucherProduct/voucher-product.service';
import { ActivatedRoute } from '@angular/router';
import { ReceiptVoucherComponent } from '../../../../../shared/receipt-voucher/receipt-voucher.component';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { MaterialModule } from '../../../../../modules/material/material.module';
import { GetPaymentAmountPipe } from '../../../../../shared/pipes/get-payment-amount.pipe';
import { VoucherService } from '../../../../../services/voucher/voucher.service';
import { VoucherProductService } from '../../../../../services/voucherProduct/voucher-product.service';


@Component({
  selector: 'app-cost-of-sales-report',
  standalone: true,
  imports: [MaterialModule, GetPaymentAmountPipe],
  templateUrl: './cost-of-sales-report.component.html',
  styleUrl: './cost-of-sales-report.component.scss'
})
export class CostOfSalesReportComponent {
  isSpinning = false;
  isSpinning2 = false;
  searchControl: FormControl = new FormControl('');
  dateRange!: FormGroup;
  dataSource: any[] = [];
  filteredData: any[] = [];
  voucherProduct: any[] = [];
  reportDate!: string;
  totalqty: any = 0;
  totalCost: any = 0;
  totalMRP: any = 0;
  totalsellingprice: any = 0;
  totalprofit: any = 0;

  modal = inject(NzModalService);
  viewContainerRef = inject(ViewContainerRef);
  notification = inject(NzNotificationService);
  voucherProductService = inject(VoucherProductService);
  voucherService = inject(VoucherService);
  route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.setupSearch();
    this.setupDateRange();
    this.voucherGrp = `INVOICE`;
    this.getCostofSales()
  }

  currentPage = 1;
  pageSize = 100;

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  date: any = null;

  onChange(result: Date[]): void {
    this.date = result;
    console.log('onChange: ', result);
  }

  filterData() {
    const searchTerm = this.searchControl.value.toLowerCase();
    this.filteredData = this.dataSource.filter((item: any) => {
      const itemCode = item.itemCode ? item.itemCode.toLowerCase() : '';
      const printName = item.printName ? item.printName.toLowerCase() : '';
      return itemCode.includes(searchTerm) || printName.includes(searchTerm);
    });
  }

  setupSearch() {
    this.searchControl.valueChanges.subscribe((searchTerm) => {
      this.filterData();
      this.caltotal();
    });
  }

  getCostofSales(startDate?: any, endDate?: any) {
    this.isSpinning = true;
    this.voucherProductService.getCostofSales(startDate, endDate).subscribe(
      (res: APIResponse) => {
        this.dataSource = res.data;
        this.filteredData = res.data;
        console.log(this.filteredData)
        this.caltotal();
        this.isSpinning = false;
      },
      (error) => {
        this.isSpinning = false;
        this.notification.create('error', 'Error', error.error?.message || 'Something went wrong!');
      }
    );
  }


  caltotal() {
    this.totalqty = 0;
    this.totalCost = 0;
    this.totalMRP = 0;
    this.totalsellingprice = 0;
    this.totalprofit = 0;
    
    this.filteredData.forEach(item => {
      this.totalqty += Number(item.totalqty);
      this.totalCost += Number(item.totalCost);
      this.totalMRP += Number(item.totalMRP);
      this.totalsellingprice += Number(item.totalMRP);
    });
    this.totalprofit += Number(this.totalsellingprice - this.totalCost);
  }

  applyDateFilter() {
    this.isSpinning = true
    const startDate = this.date[0];
    const endDate = this.date[1];

    if (!startDate || !endDate) {
      this.notification.create('warning', 'Date Range Required', 'Please select both start and end dates.');
      return;
    }

    this.getCostofSales(startDate, endDate)
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

    if (data.expand) {
      this.voucherProductService.getbyGrp(data.id).subscribe((res: APIResponse) => {
        this.voucherProduct = res.data;
        this.isSpinning2 = false;
      })
    }
  }

  pdfDownload(data: any) {
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
    } else {
      const modal = this.modal.create({
        nzContent: InvoicePdfComponent,
        nzViewContainerRef: this.viewContainerRef,
        nzWidth: "900px",
        nzFooter: [],
        nzData: { data: data.id },
      })
      modal.afterClose.subscribe((result: any) => {
      });
    }

  }

}
