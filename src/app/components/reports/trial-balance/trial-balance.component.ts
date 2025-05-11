import { Component, inject, OnInit } from '@angular/core';
import { MaterialModule } from '../../../modules/material/material.module';
import { FormControl } from '@angular/forms';
import { JournallineService } from '../../../services/journalLine/journalline.service';
import { APIResponse } from '../../../shared/interface';
import { reduce } from 'rxjs';

@Component({
  selector: 'app-trial-balance',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './trial-balance.component.html',
  styleUrl: './trial-balance.component.scss'
})
export class TrialBalanceComponent implements OnInit {

  isSpinning = true
  searchControl: FormControl = new FormControl('');
  date: any = null;
  dataSource: any = [];
  filteredData: any = [];

  totalDebit: number = 0;
  totalCredit: number = 0;

  journalLineservice = inject(JournallineService)

  ngOnInit(): void {
    this.getTrailBalanceData()
    this.setupSearch()
  }

  setupSearch() {
    this.searchControl.valueChanges.subscribe((searchTerm) => {
      this.filteredData = this.dataSource.filter((account: any) =>
        account.accountName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }

  getTrailBalanceData() {
    this.journalLineservice.getTrialBalance().subscribe((res: APIResponse) => {
      this.dataSource = res.data;
      this.filteredData = res.data
      console.log(this.filteredData)
      this.isSpinning = false;
      this.calculate()
    }, (error) => {
      this.isSpinning = false;
    })
  }

  calculate() {
    this.totalDebit = this.filteredData.reduce((sum: any, acc: { debit: any; }) => sum + acc.debit, 0);
    this.totalCredit = this.filteredData.reduce((sum: any, acc: { credit: any; }) => sum + acc.credit, 0);
  }

  applyDateFilter() {
    this.journalLineservice.getTrialBalance(this.date).subscribe((res: APIResponse) => {
      this.dataSource = res.data;
      this.filteredData = res.data
      this.isSpinning = false;
      this.calculate()
      console.log(this.filteredData)
    })
  }

  exportAsCSV() {
    const headers = ['Account Name', 'Debit', 'Credit'];
    const csvData = this.filteredData.map((item: any) => ({
      accountName: item.accountName,
      debit: item.debit,
      credit: item.credit,
    }));
  
    // Calculate totals for Debit and Credit
    const totalDebit = this.filteredData.reduce((sum: number, item: any) => sum + (item.debit || 0), 0);
    const totalCredit = this.filteredData.reduce((sum: number, item: any) => sum + (item.credit || 0), 0);
  
    // Add a row for totals
    csvData.push({
      accountName: 'Total',
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
        item.accountName || '', 
        item.debit !== undefined ? item.debit : '', 
        item.credit !== undefined ? item.credit : ''
      ];
      csvRows.push(values.join(','));
    });

    return csvRows.join('\n');
  }
  
}
