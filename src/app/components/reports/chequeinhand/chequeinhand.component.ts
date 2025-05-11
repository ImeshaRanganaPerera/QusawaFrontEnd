import { Component, inject, ViewContainerRef } from '@angular/core';
import { MaterialModule } from '../../../modules/material/material.module';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { APIResponse } from '../../../shared/interface';
import { ReportSelectionComponent } from '../../vouchers/transaction/report-selection/report-selection/report-selection.component';
import { ChequeService } from '../../../services/cheque/cheque.service';
import { ChartofAccService } from '../../../services/chartofAcc/chartof-acc.service';

@Component({
  selector: 'app-chequeinhand',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './chequeinhand.component.html',
  styleUrl: './chequeinhand.component.scss'
})
export class ChequeinhandComponent {
  isSpinning = false;
  searchControl: FormControl = new FormControl('');
  filteredData: any[] = [];
  chequeList: any[] = [];
  date: any = null;
  totalAmount: number = 0;
  banklist: any[] = [];

  modal = inject(NzModalService);
  viewContainerRef = inject(ViewContainerRef);
  notification = inject(NzNotificationService);
  chequeService = inject(ChequeService);
  chartofaccService = inject(ChartofAccService);
  route = inject(ActivatedRoute);

  chequeInHandForm: FormGroup = new FormGroup({
    partyId: new FormControl(''),
    userId: new FormControl(''),
  })

  currentPage = 1;
  pageSize = 100;

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  ngOnInit(): void {
    this.setupSearch()
    this.getbank()
  }

  getbank() {
    this.chartofaccService.getChartofaccbyGrp('Bank').subscribe((res: APIResponse) => {
      this.banklist = res.data;
    })
  }

  onChange(result: Date[]): void {
    this.date = result;
  }

  updateConform(data: any) {
    if (!data.depositDate) {
      this.notification.create('error', 'Date Error', 'Please select a date')
      return;
    }
    if (!data.bankId) {
      this.notification.create('error', 'Bank Error', 'Please select a Bank')
      return;
    }

    var conformData = {
      used: true,
      depositDate: data.depositDate,
      journalEntries: [
        {
          accountId: data.bankId,
          debit: data.creditDebit === "CREDIT" ? 0 : data.amount,
          credit: data.creditDebit === "CREDIT" ? data.amount : 0,
          ref: "Cheque Deposit"
        },
        {
          accountId: 'Cheque',
          debit: data.creditDebit === "CREDIT" ? data.amount : 0,
          credit: data.creditDebit === "CREDIT" ? 0 : data.amount,
          ref: "Cheque Deposit"
        }
      ],
    }
    console.log(conformData)
    this.chequeService.updateConform(data.id, conformData).subscribe((res: APIResponse) => {
      this.notification.create('success', 'Success', res.message)
      var updatedCheque: any = res.data;
      console.log(updatedCheque)
      this.chequeList = this.chequeList.filter(cheque => cheque.id !== updatedCheque.id);
      this.filteredData = this.filteredData.filter(cheque => cheque.id !== updatedCheque.id);
    }, (error) => {
      this.notification.create('error', 'Error', error.error?.message || 'Something went Wrong')
    })
  }

  startDate: any = null;
  endDate: any = null;

  applyDateFilter() {
    this.isSpinning = true;

    // Ensure this.date exists and has two valid values (start and end dates)
    if (this.date && this.date[0] && this.date[1]) {
      this.getCheque(this.date[0], this.date[1]);
    } else {
      this.isSpinning = false;
      this.notification.error('Error', 'Please select a valid date range');
    }
  }

  setupSearch() {
    this.searchControl.valueChanges.subscribe((searchTerm) => {
      this.filteredData = this.chequeList.filter((records: any) =>
        records.chequeBankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        records.chequeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        records.releaseDate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        records.amount.toLowerCase().includes(searchTerm.toLowerCase())
      );
      this.calculateAmount();
    });
  }

  getCheque(startDate: any, endDate: any) {
    this.totalAmount = 0;
    this.chequeService.getDebitCheque(startDate, endDate).subscribe((res: APIResponse) => {
      this.chequeList = res.data;
      this.filteredData = res.data;
      this.calculateAmount()
      this.isSpinning = false;
    }, (error) => {
      this.isSpinning = false;
      this.notification.error('Error', error.error?.message || 'No Cheque Data Found');
    })
  }

  calculateAmount() {
    this.totalAmount = this.filteredData.reduce((acc, curr) => acc + Number(curr.amount), 0)
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
      }
    });
  }

  // pdfDownload(data: any) {
  //   if (this.category === 'Account') {
  //     const modal = this.modal.create({
  //       nzContent: ReceiptVoucherComponent,
  //       nzViewContainerRef: this.viewContainerRef,
  //       nzWidth: "900px",
  //       nzFooter: [],
  //       nzData: { data: data.id, type: this.type },
  //     })
  //     modal.afterClose.subscribe((result: any) => {
  //     });
  //   }
  //   if (this.type === 'Sales Return' || this.type === 'Invoice' || this.type === 'Sales Order' || this.type === 'GRN') {
  //     const modal = this.modal.create({
  //       nzContent: InvoicePdfComponent,
  //       nzViewContainerRef: this.viewContainerRef,
  //       nzWidth: "900px",
  //       nzFooter: [],
  //       nzData: { data: data.id, type: this.type },
  //     })
  //     modal.afterClose.subscribe((result: any) => {
  //     });
  //   }

  // }
}
