import { Component, inject, ViewContainerRef } from '@angular/core';
import { MaterialModule } from '../../../../modules/material/material.module';
import { FormControl } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { DiscountLevelService } from '../../../../services/discountLevel/discount-level.service';
import { APIResponse } from '../../../../shared/interface';
import { ManageDiscountlevelComponent } from '../../discountLevel/manage-discountlevel/manage-discountlevel.component';
import { ManageCommissionComponent } from '../manage-commission/manage-commission.component';
import { CommissionlevelService } from '../../../../services/commissionLevel/commissionlevel.service';

@Component({
  selector: 'app-list-commissionlevel',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './list-commissionlevel.component.html',
  styleUrl: './list-commissionlevel.component.scss'
})
export class ListCommissionlevelComponent {
  isSpinning = true;
  searchControl: FormControl = new FormControl('');
  dataSource: any[] = [];
  filteredData: any[] = [];

  //services
  notification = inject(NzNotificationService)
  model = inject(NzModalService)
  viewContainerRef = inject(ViewContainerRef)
  commissionLevel = inject(CommissionlevelService)

  ngOnInit(): void {
    this.getCommissionLevel();
    this.setupSearch();
  }

  getCommissionLevel() {
    this.isSpinning = true;
    this.commissionLevel.get().subscribe((res: APIResponse) => {
      this.dataSource = res.data;
      this.filteredData = res.data;
      this.isSpinning = false;
    }, (error) => {
      this.notification.create('error', 'Error', error.error?.message || 'Something went Wrong')
      this.isSpinning = false;
    })
  }

  setupSearch() {
    this.searchControl.valueChanges.subscribe((searchTerm) => {
      this.filteredData = this.dataSource.filter((type: any) =>
        type.commission.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }

  manageCommissionLevel(action: string, data?: any) {
    const modal = this.model.create({
      nzContent: ManageCommissionComponent,
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
    this.manageCommissionLevel('Update', data);
  }
}
