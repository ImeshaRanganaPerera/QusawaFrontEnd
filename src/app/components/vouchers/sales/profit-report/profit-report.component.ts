import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { MaterialModule } from '../../../../modules/material/material.module';

@Component({
  selector: 'app-profit-report',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './profit-report.component.html',
  styleUrls: ['./profit-report.component.scss']
})
export class ProfitReportComponent {
  dateRangeForm: FormGroup;
  profitData: { date: Date, profitOrLoss: number }[] = [];
  totalProfitOrLoss: number = 0;
  formSubmitted = false;  // To track form submission status
  isFutureDateError = false; // To track if date range includes future dates

  // Simulating service with data (replace with actual service)
  dataSource = [
    { date: '2024-09-01', salesAmount: 1000, cost: 600 },
    { date: '2024-09-02', salesAmount: 1500, cost: 800 },
    { date: '2024-09-03', salesAmount: 1200, cost: 5000 },
  ];

  constructor(
    private fb: FormBuilder,
    private message: NzMessageService  // For showing error messages
  ) {
    this.dateRangeForm = this.fb.group({
      startDate: [null, Validators.required],
      endDate: [null, Validators.required]
    });
  }

  onSubmit() {
    this.formSubmitted = true;  // Mark the form as submitted to show errors
    this.isFutureDateError = false;  // Reset the future date error flag

    if (this.dateRangeForm.invalid) {
      this.message.error('Please provide a valid date range.');
      return;
    }

    const { startDate, endDate } = this.dateRangeForm.value;
    const today = new Date();

    // Check if both start and end dates are in the future
    if (new Date(startDate) > today && new Date(endDate) > today) {
      this.isFutureDateError = true;
      this.message.error('The selected date range includes future dates. No data is available.');
      return;
    }

    // Filter data between selected dates
    const filteredData = this.dataSource.filter(item => 
      new Date(item.date) >= new Date(startDate) && new Date(item.date) <= new Date(endDate)
    );

    // Calculate profit/loss day by day
    this.profitData = filteredData.map(item => ({
      date: new Date(item.date),
      profitOrLoss: item.salesAmount - item.cost
    }));

    // Calculate total profit/loss
    this.totalProfitOrLoss = this.profitData.reduce((total, item) => total + item.profitOrLoss, 0);

    // If no data found, show an info message
    if (this.profitData.length === 0) {
      this.message.info('No data found for the selected date range.');
    }
  }
}
