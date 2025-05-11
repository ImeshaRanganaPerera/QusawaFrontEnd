import { Component, inject, ViewContainerRef } from '@angular/core';
import { MaterialModule } from '../../../modules/material/material.module';
import { FormControl } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ProductService } from '../../../services/product/product.service';
import { JournallineService } from '../../../services/journalLine/journalline.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-profit-and-lost',
  standalone: true,
  imports: [MaterialModule],
  providers: [DatePipe],
  templateUrl: './profit-and-lost.component.html',
  styleUrl: './profit-and-lost.component.scss'
})
export class ProfitAndLostComponent {
  isSpinning = false;
  loading = false;
  date: any = null;

  searchControl: FormControl = new FormControl('');
  dataSource: any[] = [];
  filteredData: any[] = [];
  discountLevels: string[] = [];
  role: any;

  //services
  model = inject(NzModalService)
  viewContainerRef = inject(ViewContainerRef)
  notification = inject(NzNotificationService)
  productservice = inject(ProductService)
  journallineService = inject(JournallineService)
  datePipe = inject(DatePipe);

  currentPage = 1;
  pageSize = 1000;

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  ngOnInit(): void {
    this.setupSearch();
    this.getRole();
  }

  getRole() {
    this.role = localStorage.getItem('role')
  }

  setupSearch() {
    this.searchControl.valueChanges.subscribe((searchTerm) => {
      this.filteredData = this.dataSource.filter((product: any) =>
        product.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }

  getprofitlostReport(startDate: any, endDate: any) {
    this.journallineService.getProfitLoss(startDate, endDate).subscribe((res: any) => {
      this.dataSource = res.data;
      this.filteredData = res.data;
      this.isSpinning = false;
      console.log(this.dataSource)
      this.calculateTotals()
    }, (error) => {
      console.error(error);
      this.isSpinning = false;
    });
  }

  totalexpencess: any
  totalincome: any
  netProfit: any
  calculateTotals() {
    this.totalexpencess = this.filteredData[0].expencess.reduce(
      (acc: any, group: any) => {
        acc.sumDebitTotal += group.sumDebitTotal || 0;
        acc.sumCreditTotal += group.sumCreditTotal || 0;
        return acc;
      },
      { sumDebitTotal: 0, sumCreditTotal: 0 }
    );

    this.totalincome = this.filteredData[1].income.reduce(
      (acc: any, group: any) => {
        acc.sumDebitTotal += group.sumDebitTotal || 0;
        acc.sumCreditTotal += group.sumCreditTotal || 0;
        return acc;
      },
      { sumDebitTotal: 0, sumCreditTotal: 0 }
    );

    this.netProfit = (this.totalincome.sumCreditTotal - this.totalincome.sumDebitTotal) - (this.totalexpencess.sumDebitTotal - this.totalexpencess.sumCreditTotal)
  }

  applyDateFilter() {
    if (!this.date || !this.date[0] || !this.date[1]) {
      this.notification.create('warning', 'Date Range Required', 'Please select both start and end dates.');
      return;
    }

    const startDate = this.date[0];
    const endDate = this.date[1];

    this.dataSource = [];
    this.filteredData = [];
    this.isSpinning = true;

    this.getprofitlostReport(startDate, endDate);

  }

  exportToCSV() {
    if (!this.filteredData || this.filteredData.length === 0) {
      this.notification.create('warning', 'No Data Available', 'There is no data to export.');
      return;
    }
  
    const csvRows = [];
    csvRows.push(['Date From', 'Date To', 'Account Name', 'Amount'].join(',')); // Header
  
    // Add date range to the first row
    csvRows.push([
      this.datePipe.transform(this.date?.[0], 'yyyy/MM/dd') || '',
      this.datePipe.transform(this.date?.[1], 'yyyy/MM/dd') || '',
      '',
      ''
    ].join(','));
  
    this.filteredData.forEach((data: any, index: number) => {
      if (data.expencess && Array.isArray(data.expencess)) {
        csvRows.push(['Expenses:', '', '', ''].join(',')); // Section header
  
        data.expencess.forEach((exp: any) => {
          csvRows.push([ '', exp.accountGroupName || '', '', '' ].join(','));
  
          if (exp.values && Array.isArray(exp.values)) {
            exp.values.forEach((val: any) => {
              csvRows.push([
                '',
                '',
                val.accountName || '',
                ((val.totalDebitAmount || 0) - (val.totalCreditAmount || 0)).toFixed(2)
              ].join(','));
            });
          }
  
          csvRows.push([
            '',
            `Total ${exp.accountGroupName || ''}`,
            '',
            ((exp.sumDebitTotal || 0) - (exp.sumCreditTotal || 0)).toFixed(2)
          ].join(','));
        });
        csvRows.push(['Total Expenses:', '', '', (this.totalexpencess.sumDebitTotal - this.totalexpencess.sumCreditTotal).toFixed(2)].join(','));
      }
  
      if (data.income && Array.isArray(data.income)) {
        csvRows.push(['Income:', '', '', ''].join(',')); // Section header
  
        data.income.forEach((inc: any) => {
          csvRows.push([ '', inc.accountGroupName || '', '', '' ].join(','));
  
          if (inc.values && Array.isArray(inc.values)) {
            inc.values.forEach((val: any) => {
              csvRows.push([
                '',
                '',
                val.accountName || '',
                ((val.totalCreditAmount || 0) - (val.totalDebitAmount || 0)).toFixed(2)
              ].join(','));
            });
          }
  
          csvRows.push([
            '',
            `Total ${inc.accountGroupName || ''}`,
            '',
            ((inc.sumCreditTotal || 0) - (inc.sumDebitTotal || 0)).toFixed(2)
          ].join(','));
        });
        csvRows.push(['Total Income:', '', '', (this.totalincome.sumCreditTotal - this.totalincome.sumDebitTotal).toFixed(2)].join(','));
      }
    });

    csvRows.push(['Net Profit:', '', '', (this.netProfit).toFixed(2)].join(','));
  
    // Convert to CSV string and create a downloadable file
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
  
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `ProfitAndLoss_Report.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

}
