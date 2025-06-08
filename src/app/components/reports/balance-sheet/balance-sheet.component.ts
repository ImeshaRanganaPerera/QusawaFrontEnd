import { Component, inject, ViewContainerRef } from '@angular/core';
import { MaterialModule } from '../../../modules/material/material.module';
import { FormControl } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { JournallineService } from '../../../services/journalLine/journalline.service';
import { ProductService } from '../../../services/product/product.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-balance-sheet',
  standalone: true,
  imports: [MaterialModule],
  providers: [DatePipe],
  templateUrl: './balance-sheet.component.html',
  styleUrl: './balance-sheet.component.scss'
})
export class BalanceSheetComponent {
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

  totalassets: any = { sumDebitTotal: 0, sumCreditTotal: 0 };
  totalEquity: any = { sumDebitTotal: 0, sumCreditTotal: 0 };
  totalLiabilities: any = { sumDebitTotal: 0, sumCreditTotal: 0 };
  netProfit: any = 0;

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  ngOnInit(): void {
    this.setupSearch();
    this.getRole();
  }

  getRole() {
    this.role = localStorage.getItem('role');
  }

  setupSearch() {
    this.searchControl.valueChanges.subscribe((searchTerm) => {
      this.filteredData = this.dataSource.filter((product: any) =>
        product.productName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }

  getprofitlostReport(date: any) {
    this.journallineService.getBalanceSheet(date).subscribe((res: any) => {
      this.dataSource = res.data;
      this.filteredData = res.data;
      this.isSpinning = false;
      console.log(this.dataSource);
      this.calculateTotals();
    }, (error) => {
      console.error(error);
      this.isSpinning = false;
    });
  }

  calculateTotals() {
    const assetsData = this.filteredData.find(item => item.assets);
    const equityData = this.filteredData.find(item => item.equity);
    const liabilitiesData = this.filteredData.find(item => item.liabilities);

    this.totalassets = assetsData?.assets.reduce(
      (acc: any, group: any) => {
        acc.sumDebitTotal += group.sumDebitTotal || 0;
        acc.sumCreditTotal += group.sumCreditTotal || 0;
        return acc;
      },
      { sumDebitTotal: 0, sumCreditTotal: 0 }
    );

    this.totalEquity = equityData?.equity.reduce(
      (acc: any, group: any) => {
        acc.sumDebitTotal += group.sumDebitTotal || 0;
        acc.sumCreditTotal += group.sumCreditTotal || 0;
        return acc;
      },
      { sumDebitTotal: 0, sumCreditTotal: 0 }
    );

    this.totalLiabilities = liabilitiesData?.liabilities.reduce(
      (acc: any, group: any) => {
        acc.sumDebitTotal += group.sumDebitTotal || 0;
        acc.sumCreditTotal += group.sumCreditTotal || 0;
        return acc;
      },
      { sumDebitTotal: 0, sumCreditTotal: 0 }
    );

    // Net Profit (if available)
    this.netProfit = this.filteredData.find(item => item.netProfit !== undefined)?.netProfit || 0;
  }

  applyDateFilter() {
    if (!this.date) {
      this.notification.create('warning', 'Date Required', 'Please select Date.');
      return;
    }

    this.dataSource = [];
    this.filteredData = [];
    this.isSpinning = true;

    this.getprofitlostReport(this.date);
  }

  exportToCSV() {
    if (!this.filteredData || this.filteredData.length === 0) {
      this.notification.create('warning', 'No Data Available', 'There is no data to export.');
      return;
    }

    const csvRows = [];
    csvRows.push(['Date', '', 'Account Name', 'Amount'].join(',')); // Header

    csvRows.push([
      this.datePipe.transform(this.date, 'yyyy/MM/dd') || '',
      '',
      ''
    ].join(','));

    this.filteredData.forEach((data: any) => {
      if (data.assets && Array.isArray(data.assets)) {
        csvRows.push(['Assets', '', '', ''].join(','));

        data.assets.forEach((asset: any) => {
          csvRows.push(['', asset.accountGroupName || '', '', ''].join(','));

          if (asset.values && Array.isArray(asset.values)) {
            asset.values.forEach((val: any) => {
              if (asset.accountGroupName !== 'Receivable') {
                csvRows.push([
                  '',
                  '',
                  val.accountName || '',
                  ((val.totalDebitAmount || 0) - (val.totalCreditAmount || 0)).toFixed(2)
                ].join(','));
              }
            });
          }

          csvRows.push([
            '',
            `Total ${asset.accountGroupName || ''}`,
            '',
            ((asset.sumDebitTotal || 0) - (asset.sumCreditTotal || 0)).toFixed(2)
          ].join(','));
        });

        csvRows.push(['Total Assets:', '', '', (this.totalassets.sumDebitTotal - this.totalassets.sumCreditTotal).toFixed(2)].join(','));
      }

      if (data.equity && Array.isArray(data.equity)) {
        csvRows.push(['Equity', '', '', ''].join(','));

        data.equity.forEach((equ: any) => {
          csvRows.push(['', equ.accountGroupName || '', '', ''].join(','));

          if (equ.values && Array.isArray(equ.values)) {
            equ.values.forEach((val: any) => {
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
            `Total ${equ.accountGroupName || ''}`,
            '',
            ((equ.sumCreditTotal || 0) - (equ.sumDebitTotal || 0)).toFixed(2)
          ].join(','));
        });

        csvRows.push(['Total Equity:', '', '', (this.totalEquity.sumCreditTotal - this.totalEquity.sumDebitTotal).toFixed(2)].join(','));
      }

      if (data.liabilities && Array.isArray(data.liabilities)) {
        csvRows.push(['Liabilities', '', '', ''].join(','));

        data.liabilities.forEach((lia: any) => {
          csvRows.push(['', lia.accountGroupName || '', '', ''].join(','));

          if (lia.values && Array.isArray(lia.values)) {
            lia.values.forEach((val: any) => {
              if (lia.accountGroupName !== 'Payable') {
                csvRows.push([
                  '',
                  '',
                  val.accountName || '',
                  ((val.totalCreditAmount || 0) - (val.totalDebitAmount || 0)).toFixed(2)
                ].join(','));
              }
            });
          }

          csvRows.push([
            '',
            `Total ${lia.accountGroupName || ''}`,
            '',
            ((lia.sumCreditTotal || 0) - (lia.sumDebitTotal || 0)).toFixed(2)
          ].join(','));
        });

        csvRows.push(['Total Liabilities:', '', '', (this.totalLiabilities.sumCreditTotal - this.totalLiabilities.sumDebitTotal).toFixed(2)].join(','));
      }
    });

    // Net Profit
    csvRows.push(['Net Profit:', '', '', this.netProfit.toFixed(2)].join(','));

    // Total Balance Row
    csvRows.push([
      'Total Liabilities + Equity + Net Profit:',
      '',
      '',
      (
        (this.totalLiabilities.sumCreditTotal - this.totalLiabilities.sumDebitTotal)
        + (this.totalEquity.sumCreditTotal - this.totalEquity.sumDebitTotal)
        + this.netProfit
      ).toFixed(2)
    ].join(','));

    // Convert to CSV string and download
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `Balance Sheet Report.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
