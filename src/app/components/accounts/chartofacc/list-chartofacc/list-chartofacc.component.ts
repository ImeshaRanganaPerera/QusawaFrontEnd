import { Component, inject, ViewContainerRef } from '@angular/core';
import { ManageChartofaccComponent } from '../manage-chartofacc/manage-chartofacc.component';
import { ChartofAccService } from '../../../../services/chartofAcc/chartof-acc.service';
import { FormControl } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { APIResponse } from '../../../../shared/interface';
import { MaterialModule } from '../../../../modules/material/material.module';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';

@Component({
  selector: 'app-list-chartofacc',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './list-chartofacc.component.html',
  styleUrl: './list-chartofacc.component.scss'
})
export class ListChartofaccComponent {
  isSpinning = true;
  searchControl: FormControl = new FormControl('');
  dataSource: any[] = [];
  filteredData: any[] = [];
  responseMessage: any;

  params: string = '';
  type: string = '';
  name: string = '';
  list: any;

  //services
  route = inject(ActivatedRoute)
  model = inject(NzModalService)
  viewContainerRef = inject(ViewContainerRef)
  notification = inject(NzNotificationService)
  chartofaccservice = inject(ChartofAccService)

  currentPage = 1;
  pageSize = 100;

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.params = params['type'];
    })
    if (this.params === "Category") {
      this.name = "Account Category"
      this.list = this.chartofaccservice.getAccSubcategory()
    }
    else if (this.params === "Group") {
      this.name = "Account Group"
      this.list = this.chartofaccservice.getAccountGroup()
    }
    else if (this.params === "Account") {
      this.name = "Chart of Accounts"
      this.list = this.chartofaccservice.getChartofacc()
    }
    this.getList(this.list);
    this.setupSearch();
  }

  setupSearch() {
    this.searchControl.valueChanges.subscribe((searchTerm) => {
      if (this.params === "Account") {
        this.filteredData = this.dataSource.filter((account: any) =>
          account.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          account.AccountSubCategory?.accountSubName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          account.accGroup?.accountGroupName.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      if (this.params === "Group") {
        this.filteredData = this.dataSource.filter((account: any) =>
          account.accountGroupName.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      if (this.params === "Category") {
        this.filteredData = this.dataSource.filter((account: any) =>
          account.accountSubName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          account.AccountCategory?.accCategory.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
    });
  }
  getList(observable$: Observable<APIResponse>) {
    observable$.subscribe(
      (res: APIResponse) => {
        const sortedData = res.data.sort((a: any, b: any) => {
          const nameA = a.accGroup?.accountGroupName?.toLowerCase() || '';
          const nameB = b.accGroup?.accountGroupName?.toLowerCase() || '';
          return nameA.localeCompare(nameB);
        });

        this.dataSource = sortedData;
        this.filteredData = sortedData;
        this.responseMessage = res.message;
        this.isSpinning = false;
      },
      (error) => {
        this.responseMessage = error.error?.message || 'Something went Wrong!';
        this.isSpinning = false;
        this.notification.create('error', 'Error', this.responseMessage);
      }
    );
  }

  // getList(observable$: Observable<APIResponse>) {
  //   observable$.subscribe((res: APIResponse) => {
  //     this.dataSource = res.data
  //     this.filteredData = res.data
  //     this.responseMessage = res.message;
  //     this.isSpinning = false;
  //   }, (error) => {
  //     this.responseMessage = error.error?.message || 'Something went Wrong!'
  //     this.isSpinning = false;
  //     this.notification.create('error', 'Error', this.responseMessage)
  //   })
  // }

  manageProduct(action: string, data?: any) {
    const modal = this.model.create({
      nzContent: ManageChartofaccComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzWidth: "700px",
      nzFooter: [],
      nzData: { data: data, param: this.params, action: action },
    })
    modal.afterClose.subscribe((result: any) => {
      if (result && result.message) {
        if (action === 'Create' && result.data) {
          this.dataSource = [result.data, ...this.dataSource];
        } else if (action === 'Update' && result.data) {
          const index = this.dataSource.findIndex(acc => acc.id === result.data.id);
          if (index !== -1) {
            this.dataSource[index] = result.data;
          }
        }
        this.filteredData = [...this.dataSource];
        this.notification.create('success', 'Success', result.message)
      }
      else {
        this.notification.create('info', 'Info', 'No changes were made.')
      }
    });
  }

  handleEdit(data: any) {
    this.manageProduct('Update', data);
  }
}