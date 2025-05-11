import { Component, inject, ViewContainerRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { PartyService } from '../../../../services/party/party.service';
import { IParty, APIResponse } from '../../../../shared/interface';
import { MaterialModule } from '../../../../modules/material/material.module';
import { ManageSupplierComponent } from '../manage-supplier/manage-supplier.component';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './supplier-list.component.html',
  styleUrl: './supplier-list.component.scss'
})
export class SupplierListComponent {

  isSpinning = true;
  searchControl: FormControl = new FormControl('');
  dataSource: IParty[] = [];
  filteredData: IParty[] = [];

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
    this.getSupplier();
    this.setupSearch();
  }

  getSupplier() {
    this.partyservice.getbygroup('SUPPLIER', true).subscribe((res: APIResponse) => {
      this.dataSource = res.data;
      this.filteredData = res.data;
      this.isSpinning = false;
    }, (error) => {
      this.notification.create('error', 'Error', error.error?.message || 'Something went wrong!')
    })
  }

  setupSearch() {
    this.searchControl.valueChanges.subscribe((searchTerm) => {
      this.filteredData = this.dataSource.filter((party: any) =>
        party.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        party.address1.toLowerCase().includes(searchTerm.toLowerCase()) ||
        party.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        party.phoneNumber.toString().includes(searchTerm) ||
        party.nic.toString().includes(searchTerm)
      );
    });
  }

  manageCustomer(action: string, data?: any) {
    const modal = this.model.create({
      nzContent: ManageSupplierComponent,
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
    this.manageCustomer('Update', data);
  }
}

