import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './../../../modules/material/material.module';
interface Transaction {
  date: string;
  description: string;
  type: 'Debit' | 'Credit';
  amount: number;
}

@Component({
  selector: 'app-daybook',
  standalone: true,
  imports: [CommonModule,MaterialModule],
  templateUrl: './daybook.component.html',
  styleUrl: './daybook.component.scss'
})
export class DaybookComponent {
transactions: Transaction[] = [];
  
  newTransaction: Transaction = {
    date: '',
    description: '',
    type: 'Debit',
    amount: 0
  };

  addTransaction() {
    this.transactions.push({ ...this.newTransaction });
    this.resetForm();
  }

  resetForm() {
    this.newTransaction = {
      date: '',
      description: '',
      type: 'Debit',
      amount: 0
    };
  }

  get totalDebit(): number {
    return this.transactions
      .filter(t => t.type === 'Debit')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  get totalCredit(): number {
    return this.transactions
      .filter(t => t.type === 'Credit')
      .reduce((sum, t) => sum + t.amount, 0);
  }
}
