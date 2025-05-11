import { Component, OnInit, ViewContainerRef, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../../../services/product/product.service';
import { MaterialModule } from '../../../../../modules/material/material.module';
import { IVoucher,APIResponse } from '../../../../../shared/interface';
// import { InvoicePdfComponent } from '../../../shared/invoice-pdf/invoice-pdf.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { VoucherService } from '../../../../../services/voucher/voucher.service';
import { ReportSelectionComponent } from '../../../../vouchers/transaction/report-selection/report-selection/report-selection.component';
import { VoucherProductService } from '../../../../../services/voucherProduct/voucher-product.service';
// import { ReceiptVoucherComponent } from '../../../shared/receipt-voucher/receipt-voucher.component';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-all-centers-one-product-report',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './all-centers-one-product-report.component.html',
  styleUrl: './all-centers-one-product-report.component.scss'
})
export class AllCentersOneProductReportComponent implements OnInit {
  isSpinning = true;
  reportDate!: string;
  stockData: any[] = [];
  dateRange!: FormGroup;
  searchControl: FormControl = new FormControl('');
  filteredData: any[] = [];
  dataSource: IVoucher[] = [];

  date: any = null;

  modal = inject(NzModalService);
  viewContainerRef = inject(ViewContainerRef);
  notification = inject(NzNotificationService);
  voucherProductService = inject(VoucherProductService);
  voucherService = inject(VoucherService);
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);

  ngOnInit() {
    this.reportDate = this.route.snapshot.queryParams['date'];
    // this.productId = this.route.snapshot.params['productId'];
    // this.loadStockData();
  }

  // loadStockData() {
  //   this.productService.getStockByProduct(this.productId).subscribe((res: APIResponse) => {
  //     this.stockData = res.data;
  //     this.productName = this.stockData[0]?.productName || 'Unknown Product';
  //     this.isSpinning = false;
  //   }, (error) => {
  //     console.error('Error loading stock data:', error);
  //     this.isSpinning = false;
  //   });
  // }

  onChange(result: Date[]): void {
    this.date = result;
    console.log('onChange: ', result);
  }
  
  setupSearch() {
    this.searchControl.valueChanges.subscribe((searchTerm) => {
      this.filterData();
    });
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
      console.log(this.dataSource)
      this.filterData();
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

}
