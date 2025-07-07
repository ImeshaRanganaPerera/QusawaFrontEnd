import { Component, inject, OnInit, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { MaterialModule } from '../../../../modules/material/material.module';
import { FormControl } from '@angular/forms';
import { APIResponse, IProduct } from '../../../../shared/interface';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ManageProductComponent } from '../manage-product/manage-product.component';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ProductService } from '../../../../services/product/product.service';
import { ManageProductPriceComponent } from '../manage-product-price/manage-product-price.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
})
export class ProductListComponent implements OnInit {
  isSpinning = true;
  loading = false;

  searchControl: FormControl = new FormControl('');
  dataSource: IProduct[] = [];
  filteredData: IProduct[] = [];

  //services
  model = inject(NzModalService)
  viewContainerRef = inject(ViewContainerRef)
  notification = inject(NzNotificationService)
  productservice = inject(ProductService)

  ngOnInit(): void {
    this.getProduct();
    this.setupSearch();
  }

  currentPage = 1;
  pageSize = 100;

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  setupSearch() {
    this.searchControl.valueChanges.subscribe((searchTerm) => {
      this.filteredData = this.dataSource.filter((product: any) =>
        product.printName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.itemCode.toString().includes(searchTerm) ||
        product.barcode.toString().includes(searchTerm)
      );
    });
  }
  getProduct() {
    this.isSpinning = true;
    this.productservice.get().subscribe(
      (res: APIResponse) => {
        const sortedData = res.data.sort((a: any, b: any) =>
          a.printName.localeCompare(b.printName)
        );
        this.dataSource = sortedData;
        this.filteredData = sortedData;
        this.isSpinning = false;
      },
      (error) => {
        this.isSpinning = false;
        this.notification.create('error', 'error', error.error?.message || 'Something went wrong!');
      }
    );
  }

  // getProduct() {
  //   this.isSpinning = true;
  //   this.productservice.get().subscribe((res: APIResponse) => {
  //     this.dataSource = res.data;
  //     this.filteredData = res.data;
  //     this.isSpinning = false;
  //   }, (error) => {
  //     this.isSpinning = false;
  //     this.notification.create('error', 'error', error.error?.message || 'Something went wrong!')
  //   })
  // }

  manageProduct(action: string, data?: any) {
    const modal = this.model.create({
      nzContent: ManageProductComponent,
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

  changePrice(action: string, data?: any) {
    const modal = this.model.create({
      nzContent: ManageProductPriceComponent,
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

  updatestatus(data: any): void {
    if (!this.loading) {
      this.loading = true;
      var status = {
        status: !data.status
      }
      this.productservice.updateStatus(data.id, status).subscribe((res: APIResponse) => {
        this.notification.create('success', 'Success', res.message)
        this.loading = false;
      }, (error) => {
        this.loading = false;
        this.notification.create('error', 'Error', error.error?.message || 'Something went wrong!')
      })
    }
  }

  handleEdit(data: any) {
    this.manageProduct('Update', data);
  }
}
