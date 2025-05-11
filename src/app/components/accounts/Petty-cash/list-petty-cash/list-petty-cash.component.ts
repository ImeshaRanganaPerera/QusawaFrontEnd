import { Component, inject, OnInit, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { MaterialModule } from '../../../../modules/material/material.module';
import { FormControl } from '@angular/forms';
import { APIResponse, IProduct } from '../../../../shared/interface';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ManagePettyCashComponent } from '../manage-petty-cash/manage-petty-cash.component';
// import { ManageProductComponent } from '../manage-product/manage-product.component';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ProductService } from '../../../../services/product/product.service';
import { ManageProductPriceComponent } from '../../../product master/product/manage-product-price/manage-product-price.component';
// import { ManageProductPriceComponent } from '../manage-product-price/manage-product-price.component';
import { JournallineService } from '../../../../services/journalLine/journalline.service';
import { ChartofAccService } from '../../../../services/chartofAcc/chartof-acc.service';
import { reduce } from 'rxjs';
import { PettyCashService } from '../../../../services/pettyCash/petty-cash.service';
import { UpdateIouComponent } from '../update-iou/update-iou.component';


@Component({
  selector: 'app-list-petty-cash',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './list-petty-cash.component.html',
  styleUrl: './list-petty-cash.component.scss'
})
export class ListPettyCashComponent implements OnInit {

  isSpinning = false;
  searchControl: FormControl = new FormControl('');
  pettyCashList: any[] = [];
  pettyCashIOUList: any[] = [];
  filteredData: any[] = [];
  filteredData2: any[] = [];
  balance: number = 0;
  mode: string = 'Petty Cash'

  //services
  model = inject(NzModalService)
  viewContainerRef = inject(ViewContainerRef)
  notification = inject(NzNotificationService)
  productservice = inject(ProductService)
  journallineService = inject(JournallineService)
  chartofaccService = inject(ChartofAccService)
  pettyCashIOUService = inject(PettyCashService)

  currentPage = 1;
  pageSize = 100;

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  ngOnInit(): void {
    this.getPettyCash();
    this.setupSearch();
    this.getBalance();
  }

  onTabClick(modes: any) {
    this.mode = modes
    if (this.mode === 'Petty Cash') {
      this.getPettyCash();
      this.setupSearch();
      this.currentPage = 1;
      this.pageSize = 100;
    }
    else {
      this.currentPage = 1;
      this.pageSize = 100;
      this.getPettycashIOU();
      this.setupSearch();
    }
  }

  setupSearch() {
    if (this.mode === 'Petty Cash') {
      this.searchControl.valueChanges.subscribe((searchTerm) => {
        this.filteredData = this.pettyCashList.filter((pettyCash: any) =>
          pettyCash.account.accountName.includes(searchTerm.toLowerCase()) ||
          pettyCash.debitAmount.toString().includes(searchTerm)
        );
      });
    }
    else {
      this.searchControl.valueChanges.subscribe((searchTerm) => {
        this.filteredData2 = this.pettyCashIOUList.filter((iou: any) =>
          iou.user.username.includes(searchTerm.toLowerCase()) ||
          iou.amount.toString().includes(searchTerm)
        );
      });
    }
  }

  getPettyCash() {
    if (this.pettyCashList.length === 0) {
      this.journallineService.getbyref("Petty Cash Exp").subscribe((res: APIResponse) => {
        this.pettyCashList = res.data;
        this.filteredData = res.data;
        console.log(res.data)
      })
    }
    else {
      this.filteredData = this.pettyCashList
    }
  }

  getPettycashIOU() {
    if (this.pettyCashIOUList.length === 0) {
      this.pettyCashIOUService.get().subscribe((res: APIResponse) => {
        this.pettyCashIOUList = res.data;
        this.filteredData2 = res.data;
        console.log(res.data)
      })
    }
    else {
      this.filteredData2 = this.pettyCashIOUList
    }
  }

  getBalance() {
    this.chartofaccService.getChartofaccBalance('PETTY CASH').subscribe((res: APIResponse) => {
      this.balance = Number(res.data); // Directly assigning the number value
      console.log(this.balance);
    });
  }

  checkout(action: any) {
    this.managePettyCash(this.mode, action, this.balance)
  }

  managePettyCash(mode: string, action: string, amount?: any) {
    const modal = this.model.create({
      nzContent: ManagePettyCashComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzWidth: "700px",
      nzFooter: [],
      nzData: { mode: mode, amount: amount, action: action },
    })
    modal.afterClose.subscribe((result: any) => {
      if (result && result.message) {
        if (action === 'Create' && result.data) {
          if (mode === 'Petty Cash') {
            this.pettyCashList = [result.data, ...this.pettyCashList];
            this.balance = this.balance - result.data.debitAmount;
          }
          else {
            this.pettyCashIOUList = [result.data, ...this.pettyCashIOUList];
            this.balance = this.balance - result.data.amount;
            console.log(this.pettyCashIOUList)
          }

        } else if (action === 'Update' && result.data) {
          const index = this.pettyCashList.findIndex(item => item.id === result.data.id);
          if (index !== -1) {
            this.pettyCashList[index] = result.data;
          }
        }
        this.filteredData = [...this.pettyCashList];
        this.notification.create('success', 'Success', result.message)
      }
      else {
        this.notification.create('info', 'Info', 'No changes were made.')
      }
    });
  }

  manageIOU(data?: any, action?: string, amount?: any) {
    const modal = this.model.create({
      nzContent: UpdateIouComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzWidth: "700px",
      nzFooter: [],
      nzData: { data: data, amount: amount, action: action },
    })
    modal.afterClose.subscribe((result: any) => {
      if (result && result.message) {
        if (action === 'Create' && result.data) {

          this.pettyCashList = [result.data, ...this.pettyCashList];
          this.balance = this.balance - result.data.debitAmount;

        } else if (action === 'Update' && result.data) {
          const index = this.pettyCashList.findIndex(item => item.id === result.data.id);
          if (index !== -1) {
            this.pettyCashList[index] = result.data;
          }
        }
        this.filteredData = [...this.pettyCashList];
        this.notification.create('success', 'Success', result.message)
      }
      else {
        this.notification.create('info', 'Info', 'No changes were made.')
      }
    });
  }

  handleEdit(data: any) {
    this.manageIOU(data, 'Update', this.balance);
  }

}
