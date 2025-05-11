
import { CenterService } from '../../../../../services/center/center.service';
import { Component, OnInit, ViewContainerRef, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../../../services/product/product.service';
import { IVoucher,APIResponse } from '../../../../../shared/interface';
import { MaterialModule } from '../../../../../modules/material/material.module';
// import { InvoicePdfComponent } from '../../../shared/invoice-pdf/invoice-pdf.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { VoucherService } from '../../../../../services/voucher/voucher.service';
import { ReportSelectionComponent } from '../../../../vouchers/transaction/report-selection/report-selection/report-selection.component';
import { VoucherProductService } from '../../../../../services/voucherProduct/voucher-product.service';
// import { ReceiptVoucherComponent } from '../../../shared/receipt-voucher/receipt-voucher.component';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-one-center-all-product-report',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './one-center-all-product-report.component.html',
  styleUrl: './one-center-all-product-report.component.scss'
})
export class OneCenterAllProductReportComponent {
  isSpinning = true;
  centerId!: string;
  centerName: string = '';
  searchControl: FormControl = new FormControl('');
  stockData: any[] = [];
  filteredStockData: any[] = [];
  filteredData: any[] = [];
  dataSource: IVoucher[] = [];
  dateRange!: FormGroup;

  date: any = null;

  modal = inject(NzModalService);
  viewContainerRef = inject(ViewContainerRef);
  voucherProductService = inject(VoucherProductService);
  voucherService = inject(VoucherService);


  // Services
  notification = inject(NzNotificationService);
  productService = inject(ProductService);
  centerService = inject(CenterService);
  route = inject(ActivatedRoute);

  ngOnInit(): void {
    // this.centerId = this.route.snapshot.paramMap.get('centerId');
    this.getCenterDetails();
    // this.getStockReport();
    this.setupSearch();
  }

  setupSearch() {
    this.searchControl.valueChanges.subscribe((searchTerm) => {
      this.filteredStockData = this.stockData.filter((product: any) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }

  getCenterDetails() {
    this.centerService.getbyId(this.centerId).subscribe((res: APIResponse) => {
      // this.centerName = res.data.centerName;
    }, (error) => {
      this.notification.create('error', 'Error', error.error?.message || 'Failed to fetch center details');
    });
  }

  // getStockReport() {
  //   this.isSpinning = true;
  //   this.productService.getStockByCenter(this.centerId).subscribe((res: APIResponse) => {
  //     this.stockData = res.data;
  //     this.filteredStockData = res.data;
  //     this.isSpinning = false;
  //   }, (error) => {
  //     this.isSpinning = false;
  //     this.notification.create('error', 'Error', error.error?.message || 'Failed to fetch stock report');
  //   });
  // }

  onChange(result: Date[]): void {
    this.date = result;
    console.log('onChange: ', result);
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
