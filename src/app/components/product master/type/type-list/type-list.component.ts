import { Component, inject, OnInit, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { IType, APIResponse } from '../../../../shared/interface';
import { ManageTypeComponent } from '../manage-type/manage-type.component';
import { MaterialModule } from '../../../../modules/material/material.module';
import { TypeService } from '../../../../services/type/type.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-type-list',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './type-list.component.html',
  styleUrl: './type-list.component.scss',
})
export class TypeListComponent implements OnInit {

  isSpinning = true;
  searchControl: FormControl = new FormControl('');
  dataSource: IType[] = [];
  filteredData: IType[] = [];

  //services
  notification = inject(NzNotificationService)
  model = inject(NzModalService)
  viewContainerRef = inject(ViewContainerRef)
  typeservice = inject(TypeService)
 
  currentPage = 1;
  pageSize = 100;

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  ngOnInit(): void {
    this.getTypes();
    this.setupSearch();
  }

  getTypes() {
    this.isSpinning = true;
    this.typeservice.get().subscribe((res: APIResponse) => {
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
        type.typeName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }

  manageType(action: string, data?: any) {
    const modal = this.model.create({
      nzContent: ManageTypeComponent,
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
    this.manageType('Update', data);
  }
}
