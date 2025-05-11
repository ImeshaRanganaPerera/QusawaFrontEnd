import { Component, inject, ViewContainerRef } from '@angular/core';
import { MaterialModule } from '../../../modules/material/material.module';
import { CenterService } from '../../../services/center/center.service';
import { ManageCenterComponent } from '../manage-center/manage-center.component';
import { FormControl } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { APIResponse, ICenter } from '../../../shared/interface';

@Component({
  selector: 'app-center-list',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './center-list.component.html',
  styleUrl: './center-list.component.scss'
})
export class CenterListComponent {
  isSpinning = true;
  searchControl: FormControl = new FormControl('');
  dataSource: ICenter[] = [];
  filteredData: ICenter[] = [];

  //services
  model = inject(NzModalService)
  viewContainerRef = inject(ViewContainerRef)
  notification = inject(NzNotificationService)
  centerservice = inject(CenterService)

  ngOnInit(): void {
    this.getCenter();
    this.setupSearch();
  }

  getCenter() {
    this.centerservice.get().subscribe((res: APIResponse) => {
      this.dataSource = res.data;
      this.filteredData = res.data;
      this.isSpinning = false;
    })
  }

  setupSearch() {
    this.searchControl.valueChanges.subscribe((searchTerm) => {
      this.filteredData = this.dataSource.filter((center: any) =>
        center.centerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        center.mode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }

  manageCenter(action: string, data?: any) {
    const modal = this.model.create({
      nzContent: ManageCenterComponent,
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
      else{
        this.notification.create('info', 'Info', 'No changes were made.')
      }
    });
  }

  handleEdit(data: any) {
    this.manageCenter('Update', data);
  }
}
