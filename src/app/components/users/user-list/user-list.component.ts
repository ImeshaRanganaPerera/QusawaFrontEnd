import { Component, inject, ViewContainerRef } from '@angular/core';
import { MaterialModule } from '../../../modules/material/material.module';
import { FormControl } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { APIResponse, IUser } from '../../../shared/interface';
import { ManageUserComponent } from '../manage-user/manage-user.component';
import { UserService } from '../../../services/user/user.service';
import { CenterService } from '../../../services/center/center.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent {
  isSpinning = true;
  searchControl: FormControl = new FormControl('');
  dataSource: IUser[] = [];
  filteredData: IUser[] = [];

  //services
  model = inject(NzModalService)
  viewContainerRef = inject(ViewContainerRef)
  notification = inject(NzNotificationService)
  userservice = inject(UserService)
  centerservice = inject(CenterService)

  currentPage = 1;
  pageSize = 100;

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  ngOnInit(): void {
    this.getUser();
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

  getUser() {
    this.isSpinning = true;
    this.userservice.get().subscribe((res: APIResponse) => {
      this.dataSource = res.data;
      this.filteredData = res.data;
      this.isSpinning = false;
    }, (error) => {
      this.isSpinning = false;
      this.notification.create('error', 'error', error.error?.message || 'Something went wrong!')
    })
  }

  deleteUser(data: any) {
    this.userservice.deleteUser(data.id).subscribe((res: any) => {
      this.notification.create('success', 'Success', res.message)
      this.dataSource = this.dataSource.filter(item => item.id !== res.data.id);
      this.filteredData = this.filteredData.filter(item => item.id !== res.data.id);
    }, (error) => {
      this.notification.create('error', 'error', error.error?.message || 'Something went wrong!')
    })
  }

  manageUser(action: string, data?: any) {
    const modal = this.model.create({
      nzContent: ManageUserComponent,
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
          console.log(result.data)
          console.log(result.data.id)
          const index = this.dataSource.findIndex(item => item.id === result.data.id);
          if (index !== -1) {
            this.dataSource[index] = result.data;
            this.filteredData[index] = result.data;
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
    this.manageUser('Update', data);
  }

  cancel(): void {
    this.nzMessageService.info('click cancel');
  }

  constructor(private nzMessageService: NzMessageService) { }
}
