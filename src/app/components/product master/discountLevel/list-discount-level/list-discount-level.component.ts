import { Component, inject, ViewContainerRef } from '@angular/core';
import { MaterialModule } from '../../../../modules/material/material.module';
import { APIResponse, IDiscountLevel } from '../../../../shared/interface';
import { FormControl } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ManageBrandComponent } from '../../brand/manage-brand/manage-brand.component';
import { DiscountLevelService } from '../../../../services/discountLevel/discount-level.service';
import { ManageDiscountlevelComponent } from '../manage-discountlevel/manage-discountlevel.component';

@Component({
  selector: 'app-list-discount-level',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './list-discount-level.component.html',
  styleUrl: './list-discount-level.component.scss'
})
export class ListDiscountLevelComponent {
  isSpinning = true;
  searchControl: FormControl = new FormControl('');
  dataSource: any[] = [];
  filteredData: any[] = [];

  //services
  notification = inject(NzNotificationService)
  model = inject(NzModalService)
  viewContainerRef = inject(ViewContainerRef)
  discountLevelService = inject(DiscountLevelService)

  ngOnInit(): void {
    this.getDiscountLevels();
    this.setupSearch();
  }

  getDiscountLevels() {
    this.isSpinning = true;
    this.discountLevelService.get().subscribe((res: APIResponse) => {
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
      this.filteredData = this.dataSource.filter((dis: any) =>
        dis.level.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }

  manageDiscountLevel(action: string, data?: any) {
    const modal = this.model.create({
      nzContent: ManageDiscountlevelComponent,
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
    this.manageDiscountLevel('Update', data);
  }
}
