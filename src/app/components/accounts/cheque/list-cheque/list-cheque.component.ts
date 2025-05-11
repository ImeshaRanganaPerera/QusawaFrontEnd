import { Component, inject, OnInit, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { MaterialModule } from '../../../../modules/material/material.module';
import { FormControl } from '@angular/forms';
import { APIResponse, IChequeBook } from '../../../../shared/interface';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ManageChequeComponent } from '../manage-cheque/manage-cheque.component';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ChequebookService } from '../../../../services/chequebook/chequebook.service';

@Component({
  selector: 'app-list-cheque',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './list-cheque.component.html',
  styleUrl: './list-cheque.component.scss'
})
export class ListChequeComponent implements OnInit {

  isSpinning = false;
  searchControl: FormControl = new FormControl('');
  dataSource: IChequeBook[] = [];
  filteredData: IChequeBook[] = [];

  //services
  model = inject(NzModalService)
  viewContainerRef = inject(ViewContainerRef)
  notification = inject(NzNotificationService)
  chequeBookservice = inject(ChequebookService)

  currentPage = 1;
  pageSize = 100;

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  ngOnInit(): void {
    this.getChequeBook();
    this.setupSearch();
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

  getChequeBook() {
    this.chequeBookservice.get().subscribe((res: APIResponse) => {
      this.dataSource = res.data;
      this.filteredData = res.data;
    }, (error) => {
      this.notification.create('error', 'Error', error.error?.message || 'Something went Wrong')
    })
  }

  manageProduct(action: string, data?: any) {
    const modal = this.model.create({
      nzContent: ManageChequeComponent,
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
    this.manageProduct('Update', data);
  }

}
