import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { DecimalPipe } from '@angular/common';
import { VoucherService } from '../../../services/voucher/voucher.service';
import { MaterialModule } from '../../../modules/material/material.module';

@Component({
  selector: 'app-dash',
  standalone: true,
  imports: [NgxChartsModule, CommonModule, DecimalPipe, MaterialModule],
  templateUrl: './dash.component.html',
  styleUrl: './dash.component.scss'
})
export class DashComponent implements OnInit {

  chunkedDetailList: any[][] = [];

  voucherSerivce = inject(VoucherService)
  detailList: any[] = [];
  private refreshInterval: any;
  totalSalesPercent: number = 0; // Store total sales percentage
  totalDailySales: number = 0;
  totalDailyReturnSales: number = 0;
  totalDailyVisits: number = 0;
  totalDailyInvoices: number = 0;
  totalCumulativeSales: number = 0;
  totalCumulativeReturnSales: number = 0;
  totalCumulativeVisits: number = 0;
  totalCumulativeInvoices: number = 0;

  dailyCash:number = 0;
  dailyOnlinetranfer:number = 0;
  dailyCheque:number = 0;
  dailyCredit:number = 0;

  monthlyCash:number = 0;
  monthlyOnlinetranfer:number = 0;
  monthlyCheque:number = 0;
  monthlyCredit:number = 0;

  ngOnInit() {
    this.target();
    this.refreshInterval = setInterval(() => {
      this.target();
    }, 60000);
  }

  chunkArray(array: any[], size: number): any[][] {
    const chunkedArr = [];
    for (let i = 0; i < array.length; i += size) {
      chunkedArr.push(array.slice(i, i + size));
    }
    return chunkedArr;
  }
  
  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  target() {
    this.voucherSerivce.getVouchersGroupedByUserAndMonth().subscribe((res: any) => {
      this.detailList = res.data.combinedData || []; // Fallback to empty array if res.data is undefined
      console.log(this.detailList)
      this.calculateTotalSales();
      this.chunkedDetailList = this.chunkArray(this.detailList, 3); // Chunk only after detailList is populated
    });
  }

  totalInvoiceValue = 0;
  totalTarget = 0;
  calculateTotalSales() {


    // Reset the daily and cumulative figures before calculation
    this.totalDailySales = 0;
    this.totalDailyVisits = 0;
    this.totalDailyInvoices = 0;
    this.totalCumulativeSales = 0;
    this.totalCumulativeVisits = 0;
    this.totalCumulativeInvoices = 0;

    this.totalDailyReturnSales = 0;
    this.totalCumulativeReturnSales = 0;

    this.dailyCash = 0;
    this.dailyOnlinetranfer = 0;
    this.dailyCheque = 0;
    this.dailyCredit = 0;

    this.monthlyCash = 0;
    this.monthlyOnlinetranfer = 0;
    this.monthlyCheque = 0;
    this.monthlyCredit = 0;

    this.detailList.forEach((data: any) => {
      this.totalInvoiceValue += Number(data.monthlyGroupedData.totalInvoice);
      this.totalTarget += Number(data.target);

      // Accumulate daily figures
      this.totalDailySales += Number(data.dailyGroupedData.totalInvoice);
      this.totalDailyReturnSales += Number(data.dailyGroupedData.totalReturn)
      this.totalDailyVisits += data.dailyGroupedData.visitingCount;
      this.totalDailyInvoices += data.dailyGroupedData.totalInvoiceCount;

      this.dailyCash += Number(data.dailyGroupedData.payments.Cash);
      this.dailyOnlinetranfer += Number(data.dailyGroupedData.payments.OnlineTransfer);
      this.dailyCheque += Number(data.dailyGroupedData.payments.Cheque); 
      this.dailyCredit += Number(data.dailyGroupedData.payments.Credit);

      // Accumulate cumulative figures
      this.totalCumulativeSales += Number(data.monthlyGroupedData.totalInvoice);
      this.totalCumulativeVisits += data.monthlyGroupedData.visitingCount;
      this.totalCumulativeInvoices += data.monthlyGroupedData.totalInvoiceCount;
      this.totalCumulativeReturnSales += Number(data.monthlyGroupedData.totalReturn)

      this.monthlyCash += Number(data.monthlyGroupedData.payments.Cash);
      this.monthlyOnlinetranfer += Number(data.monthlyGroupedData.payments.OnlineTransfer);
      this.monthlyCheque += Number(data.monthlyGroupedData.payments.Cheque); 
      this.monthlyCredit += Number(data.monthlyGroupedData.payments.Credit);
    });
  }


}

