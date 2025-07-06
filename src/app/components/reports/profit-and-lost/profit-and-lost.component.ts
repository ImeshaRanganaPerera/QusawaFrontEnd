import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { JournallineService } from '../../../services/journalLine/journalline.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-profit-and-lost',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatProgressSpinnerModule
  ],
  providers: [DatePipe],
  templateUrl: './profit-and-lost.component.html',
  styleUrl: './profit-and-lost.component.scss'
})
export class ProfitAndLostComponent {
  form: FormGroup;
  dataSource: any = null;
  cogsAccount: { groupName: string; account: any } | null = null;
  otherExpensesGroups: any[] = [];
  incomeGroups: any[] = [];
  grossProfit: number = 0;
  netProfit: number = 0;
  isSpinning = false;

  journallineService = inject(JournallineService);
  fb = inject(FormBuilder);
  datePipe = inject(DatePipe);

  constructor() {
    this.form = this.fb.group({
      dateRange: this.fb.group({
        start: new Date(new Date().setDate(new Date().getDate() - 30)),
        end: new Date()
      })
    });

    this.onGenerateReport(); // Load initial
  }

  onGenerateReport() {
    const { start, end } = this.form.value.dateRange;
    if (!start || !end) return;

    this.isSpinning = true;
    this.journallineService.getProfitLoss(start, end).subscribe({
      next: (res: any) => {
        this.dataSource = res.data;
        this.processData();
        this.isSpinning = false;
      },
      error: err => {
        console.error(err);
        this.isSpinning = false;
      }
    });
  }

  processData() {
    this.cogsAccount = null;
    this.incomeGroups = this.dataSource.income || [];
    const expenses = this.dataSource.expenses || [];

    this.otherExpensesGroups = [];

    for (const group of expenses) {
      const cogs = group.accounts?.find(
        (a: any) => a.accountName?.toLowerCase().trim() === 'cost of goods sold'
      );

      if (cogs) {
        this.cogsAccount = { groupName: group.accountGroupName, account: cogs };
      }

      // Exclude COGS from other expenses
      const filteredAccounts = group.accounts?.filter(
        (a: any) => a.accountName?.toLowerCase().trim() !== 'cost of goods sold'
      );

      if (filteredAccounts?.length > 0) {
        this.otherExpensesGroups.push({
          ...group,
          accounts: filteredAccounts,
          groupTotal: filteredAccounts.reduce((sum: number, a: any) => sum + (a.balance || 0), 0)
        });
      }
    }

    // Calculate gross and net profit
    const totalIncome = this.incomeGroups.reduce((sum: number, g: any) => sum + (g.groupTotal || 0), 0);
    const cogsTotal = this.cogsAccount?.account?.balance || 0;
    const totalOtherExpenses = this.otherExpensesGroups.reduce((sum: number, g: any) => sum + g.groupTotal, 0);

    this.grossProfit = totalIncome - cogsTotal;
    this.netProfit = this.grossProfit - totalOtherExpenses;
  }
}

//   exportToCSV() {
//     if (!this.dataSource) {
//       this.notification.create('warning', 'No Data Available', 'There is no data to export.');
//       return;
//     }

//     const csvRows = [];
//     csvRows.push(['Date From', 'Date To', 'Account Group', 'Account Name', 'Balance'].join(','));
//     csvRows.push([
//       this.datePipe.transform(this.date[0], 'yyyy-MM-dd'),
//       this.datePipe.transform(this.date[1], 'yyyy-MM-dd'),
//       '',
//       '',
//       ''
//     ].join(','));

//     const addGroupToCSV = (section: string, groups: any[]) => {
//       csvRows.push([section, '', '', '', ''].join(','));

//       for (const group of groups) {
//         csvRows.push(['', group.accountGroupName, '', '', ''].join(','));

//         for (const acc of group.accounts) {
//           csvRows.push([
//             '',
//             '',
//             acc.accountName,
//             '',
//             acc.balance.toFixed(2)
//           ].join(','));
//         }

//         csvRows.push([
//           '',
//           `Total ${group.accountGroupName}`,
//           '',
//           '',
//           group.groupTotal.toFixed(2)
//         ].join(','));
//       }
//     };

//     if (this.dataSource.income?.length) {
//       addGroupToCSV('Income', this.dataSource.income);
//     }

//     if (this.dataSource.expenses?.length) {
//       addGroupToCSV('Expenses', this.dataSource.expenses);
//     }

//     csvRows.push(['Net Profit', '', '', '', this.netProfit.toFixed(2)].join(','));

//     const csvString = csvRows.join('\n');
//     const blob = new Blob([csvString], { type: 'text/csv' });
//     const url = window.URL.createObjectURL(blob);

//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `ProfitAndLoss_Report.csv`;
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     window.URL.revokeObjectURL(url);
//   }
// }
function exportToCSV() {
  throw new Error('Function not implemented.');
}

