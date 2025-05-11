import { Component, inject, ViewContainerRef } from '@angular/core';
import { MaterialModule } from '../../../modules/material/material.module';
import { DatePipe } from '@angular/common';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { JournallineService } from '../../../services/journalLine/journalline.service';
import { UserService } from '../../../services/user/user.service';
import { VoucherService } from '../../../services/voucher/voucher.service';
import { APIResponse } from '../../../shared/interface';
import { ReportSelectionComponent } from '../../vouchers/transaction/report-selection/report-selection/report-selection.component';

@Component({
  selector: 'app-bank-rec-report',
  standalone: true,
  imports: [MaterialModule],
  providers: [DatePipe],
  templateUrl: './bank-rec-report.component.html',
  styleUrl: './bank-rec-report.component.scss'
})
export class BankRecReportComponent {
  isSpinning: boolean = false;
  dataSource: any[] = [];
  filteredData: any[] = [];
  userdata: any[] = [];
  searchControl: FormControl = new FormControl('');
  noResultsMessage: string = '';

  modal = inject(NzModalService);
  datePipe = inject(DatePipe);
  viewContainerRef = inject(ViewContainerRef);
  voucherService = inject(VoucherService);
  userService = inject(UserService);
  notification = inject(NzNotificationService);
  route = inject(ActivatedRoute);
  journalLineService = inject(JournallineService);

  title: string = '';
  voucherNumber: string = '';
  type: any;
  voucherGrp: any;
  category: any;

  salesmanForm: FormGroup = new FormGroup({
    userId: new FormControl(''),
    date: new FormControl(''),
  });

  ngOnInit() {
    this.getvoucher();
    this.setupSearch();
  }

  setupSearch() {
    this.searchControl.valueChanges.subscribe((searchTerm) => {
      const lowerCaseTerm = searchTerm.toLowerCase();
  
      this.filteredData = this.dataSource.filter((item: any) => {
        return item.Invoices?.some((invoice: any) => {
          const partyName = invoice.partyName ? invoice.partyName.toLowerCase() : '';
          const voucherNumber = invoice.voucherNumber ? invoice.voucherNumber.toLowerCase() : '';
          const voucherName = invoice.voucherName ? invoice.voucherName.toLowerCase() : '';
          const date = this.datePipe.transform(invoice.date, 'yyyy/MM/dd')?.toLowerCase() || '';
  
          return (
            partyName.includes(lowerCaseTerm) ||
            voucherNumber.includes(lowerCaseTerm) ||
            voucherName.includes(lowerCaseTerm) ||
            date.includes(lowerCaseTerm)
          );
        });
      });
    });
  }

  getvoucher(startDate?: any, endDate?: any) {
    this.dataSource = [];
    this.filteredData = [];
    this.isSpinning = true;
    this.voucherService.getBankRecVouchers(startDate, endDate).subscribe((res: APIResponse) => {
      this.dataSource = res.data
      this.filteredData = res.data
      console.log(this.dataSource)
      this.isSpinning = false;
    }, (error) => {
      this.isSpinning = false;
    })
  }

  applyDateFilter() {
    const startDate = this.salesmanForm.get('date')?.value[0];
    const endDate = this.salesmanForm.get('date')?.value[1];
    const userid = this.salesmanForm.get('userId')?.value;
    
    if (!startDate || !endDate) {
      this.notification.error('Date Error', 'Please select a valid date range.');
      return;
    }
    
    this.getvoucher(startDate, endDate);
  }

  calculateTotalAmount(): string {
    const total = this.filteredData.reduce((sum, group) => sum + group.totalAmount, 0);
    return total.toFixed(2);
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

  // exportToCSV() {
  //   const csvRows = [];
  //   csvRows.push(['Salesman Name', 'Total Value', 'Invoice Number', 'Date', 'Type', 'Amount'].join(','));

  //   this.filteredData.forEach(data => {
  //     csvRows.push([data.salesmanName, data.totalValue].join(','));

  //     data.Invoices.forEach((invoice: any) => {
  //       csvRows.push([
  //         '',
  //         '',
  //         invoice.voucherNumber,
  //         this.datePipe.transform(invoice.date, 'yyyy/MM/dd') || '',
  //         invoice.voucherName,
  //         invoice.amount
  //       ].join(','));
  //     });
  //   });

  //   const csvString = csvRows.join('\n');
  //   const blob = new Blob([csvString], { type: 'text/csv' });
  //   const url = window.URL.createObjectURL(blob);

  //   const a = document.createElement('a');
  //   a.setAttribute('href', url);
  //   a.setAttribute('download', 'salesman_report.csv');
  //   a.click();
  //   document.body.removeChild(a);
  //   window.URL.revokeObjectURL(url);
  // }
}
