import { Component, inject } from '@angular/core';
import { MaterialModule } from '../../../modules/material/material.module';
import { FormControl } from '@angular/forms';
import { JournallineService } from '../../../services/journalLine/journalline.service';
import { APIResponse } from '../../../shared/interface';
import { ChartofAccService } from '../../../services/chartofAcc/chartof-acc.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-ledger-listing',
  standalone: true,
  imports: [MaterialModule],
  providers: [DatePipe], 
  templateUrl: './ledger-listing.component.html',
  styleUrl: './ledger-listing.component.scss'
})
export class LedgerListingComponent {
  isSpinning = true
  searchControl: FormControl = new FormControl('');
  date: any = null;
  dataSource: any = [];
  filteredData: any = [];
  chartofaccList: any = [];
  chartofAccountId: any = null;

  totalDebit: number = 0;
  totalCredit: number = 0;

  datePipe = inject(DatePipe);
  journalLineservice = inject(JournallineService)
  chartofAccService = inject(ChartofAccService)
  notification = inject(NzNotificationService)

  currentPage = 1;
  pageSize = 1000;

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  ngOnInit(): void {
    this.getledgerData()
    this.setupSearch()
    this.getChartofAccounts()
  }

  setupSearch() {
    this.searchControl.valueChanges.subscribe((searchTerm) => {
      this.filteredData = this.dataSource.filter((account: any) =>
        account.accountName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }

  getChartofAccounts() {
    this.chartofAccService.getChartofacc().subscribe((res: APIResponse) => {
      this.chartofaccList = res.data;
    });
  }

  getledgerData() {
    this.isSpinning = true;
    this.journalLineservice.getFilteredJournalline().subscribe((res: APIResponse) => {
      this.dataSource = res.data;
      this.filteredData = res.data;
      this.isSpinning = false;
      console.log(this.filteredData)
      this.calculate()
    }, (error) => {
      this.isSpinning = false;
    })
  }

  calculate() {
    this.totalDebit = this.filteredData.reduce((sum: any, acc: { debitAmount: number; }) => sum + Number(acc.debitAmount), 0);
    this.totalCredit = this.filteredData.reduce((sum: any, acc: { creditAmount: number; }) => sum + Number(acc.creditAmount), 0);
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
    console.log(this.chartofAccountId);

    this.journalLineservice.getFilteredJournalline(this.chartofAccountId, startDate, endDate).subscribe(
      (res: APIResponse) => {
        this.dataSource = res.data;
        this.filteredData = res.data;
        this.pageSize = this.dataSource.length;
        this.isSpinning = false;
        this.calculate();
        console.log(this.filteredData);
      },
      (error) => {
        this.isSpinning = false;
      }
    );
  }

  exportAsCSV() {
    const headers = ['Date', 'Account Name', 'Invoice Number', 'Debit', 'Credit'];
    const csvData = this.filteredData.map((item: any) => ({
      date: this.datePipe.transform(item.createdAt, 'yyyy/MM/dd') || '',
      accountName: item.account.accountName || '',
      invoiceNumber: item.journal?.voucherNumber || '-', // Safely access voucherNumber
      debit: item.debitAmount || 0,
      credit: item.creditAmount || 0,
    }));

    // Calculate totals for Debit and Credit
    const totalDebit = this.filteredData.reduce((sum: number, item: any) => sum + Number(item.debitAmount || 0), 0);
    const totalCredit = this.filteredData.reduce((sum: number, item: any) => sum + Number(item.creditAmount || 0), 0);

    // Add a row for totals
    csvData.push({
      date: '',
      accountName: 'Total',
      invoiceNumber: '',
      debit: totalDebit,
      credit: totalCredit
    });

    // Generate CSV content with totals
    const csvContent = this.convertToCSV(headers, csvData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'trial-balance-report.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  convertToCSV(headers: string[], data: any[]): string {
    const csvRows = [];
    // Add the header row
    csvRows.push(headers.join(','));

    // Add the data rows
    data.forEach(item => {
      const values = [
        item.date || '',
        item.accountName || '',
        item.invoiceNumber || '',
        item.debit !== undefined ? item.debit : '',
        item.credit !== undefined ? item.credit : ''
      ];
      csvRows.push(values.join(','));
    });

    return csvRows.join('\n');
  }
}
