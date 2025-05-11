import { Component, inject, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { MaterialModule } from '../../../../modules/material/material.module';
import { ManageBrandComponent } from '../manage-brand/manage-brand.component';
import { APIResponse, IBrand } from '../../../../shared/interface';
import { FormControl } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { BrandService } from '../../../../services/brand/brand.service';

@Component({
  selector: 'app-brand-list',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './brand-list.component.html',
  styleUrl: './brand-list.component.scss',
})
export class BrandListComponent {
  isSpinning = true;
  searchControl: FormControl = new FormControl('');
  dataSource: IBrand[] = [];
  filteredData: IBrand[] = [];

  //services
  notification = inject(NzNotificationService)
  model = inject(NzModalService)
  viewContainerRef = inject(ViewContainerRef)
  brandservice = inject(BrandService)

  ngOnInit(): void {
    this.getBrands();
    this.setupSearch();
  }

  getBrands() {
    this.isSpinning = true;
    this.brandservice.get().subscribe((res: APIResponse) => {
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
        type.brandName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }

  manageBrand(action: string, data?: any) {
    const modal = this.model.create({
      nzContent: ManageBrandComponent,
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
    this.manageBrand('Update', data);
  }
}
