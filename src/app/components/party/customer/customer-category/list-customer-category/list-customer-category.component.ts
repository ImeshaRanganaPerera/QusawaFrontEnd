import { Component, inject, ViewContainerRef } from '@angular/core';
import { MaterialModule } from '../../../../../modules/material/material.module';
import { APIResponse, IPartyCategory } from '../../../../../shared/interface';
import { FormControl } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { PartyService } from '../../../../../services/party/party.service';
import { ManageCustomerComponent } from '../../manage-customer/manage-customer.component';
import { ManageCustomerCategoryComponent } from '../manage-customer-category/manage-customer-category.component';

@Component({
  selector: 'app-list-customer-category',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './list-customer-category.component.html',
  styleUrl: './list-customer-category.component.scss'
})
export class ListCustomerCategoryComponent {
  isSpinning = true;
  searchControl: FormControl = new FormControl('');
  dataSource: IPartyCategory[] = [];
  filteredData: IPartyCategory[] = [];

  //services
  model = inject(NzModalService)
  viewContainerRef = inject(ViewContainerRef)
  notification = inject(NzNotificationService)
  partyservice = inject(PartyService)
  
  currentPage = 1;
  pageSize = 100;

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  ngOnInit(): void {
    this.getCategory();
    this.setupSearch();
  }

  getCategory() {
    this.partyservice.getpartyCategory().subscribe((res: APIResponse) => {
      this.dataSource = res.data;
      this.filteredData = res.data;
      console.log(this.dataSource)
      this.isSpinning = false;
    }, (error) => {
      this.notification.create('error', 'Error', error.error?.message || 'Something went wrong!')
    })
  }

  setupSearch() {
    this.searchControl.valueChanges.subscribe((searchTerm) => {
      this.filteredData = this.dataSource.filter((party: any) =>
        party.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }

  manageCategory(action: string, data?: any) {
    const modal = this.model.create({
      nzContent: ManageCustomerCategoryComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzWidth: "700px",
      nzFooter: [],
      nzData: { data: data, action: action },
    })
    modal.afterClose.subscribe((result: any) => {
      if (result && result.message) {
        if (action === 'Create' && result.data) {
          this.dataSource = [result.data, ...this.dataSource];
        } else if (action === 'Update' && result.data) {
          const index = this.dataSource.findIndex(item => item.id === result.data.id);
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
    this.manageCategory('Update', data);
  }
}
