import { Component, inject } from '@angular/core';
import { MaterialModule } from '../../../../modules/material/material.module';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { VisitedCustomerService } from '../../../../services/visitedCustomer/visited-customer.service';
import { APIResponse } from '../../../../shared/interface';
import { UserService } from '../../../../services/user/user.service';

@Component({
  selector: 'app-visiting-customer-list',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './visiting-customer-list.component.html',
  styleUrl: './visiting-customer-list.component.scss'
})
export class VisitingCustomerListComponent {
  isSpinning = true;
  customerRecord: any[] = [];
  filteredData: any[] = [];
  userList: any[] = [];
  responseMessage: any
  date: any = null;
  userId: any = null;
  role: any = null;
  searchControl: FormControl = new FormControl('');

  visitedCustomerService = inject(VisitedCustomerService)
  userService = inject(UserService)
  notification = inject(NzNotificationService)

  newCount: number = 0;
  exsistingCount: number = 0;

  currentPage = 1;
  pageSize = 100;

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  ngOnInit(): void {
    this.getVisistedCustomerlist();
    this.setupSearch();
    this.getusers();
    this.getRole();
  }

  getRole() {
    this.role = localStorage.getItem('role')
  }

  getusers() {
    this.userService.getbyRole('SALESMEN').subscribe((res: APIResponse) => {
      this.userList = res.data;
      console.log(this.userList)
    });
  }

  setupSearch() {
    this.searchControl.valueChanges.subscribe((searchTerm) => {
      const searchLower = searchTerm ? searchTerm.toLowerCase() : "";
      this.filteredData = this.customerRecord.filter((record: any) =>
        (record.party?.name?.toLowerCase() || "").includes(searchLower) ||
        (record.user?.name?.toLowerCase() || "").includes(searchLower) ||
        (record.note?.toLowerCase() || "").includes(searchLower) ||
        (record.status?.toLowerCase() || "").includes(searchLower) ||
        (record.createdAt?.toString() || "").includes(searchTerm)
      );
      this.caltotals();
    });
  }

  onChange(result: Date[]): void {
    this.date = result;
  }

  getVisistedCustomerlist() {
    this.visitedCustomerService.get().subscribe((res: APIResponse) => {
      this.customerRecord = res.data;
      this.filteredData = res.data;
      this.caltotals()
      console.log(this.customerRecord)
      this.isSpinning = false;
    }, (error) => {
      // this.notification.create('error', 'Error', error.error?.message || 'Something went wrong!')
    })
  }

  caltotals() {
    this.newCount = 0;
    this.exsistingCount = 0;
    this.newCount = this.filteredData.filter(record => record.type === 'NEW').length;
    this.exsistingCount = this.filteredData.filter(record => record.type === 'EXISTING').length;
  }

  applyDateFilter() {
    this.isSpinning = true;

    if (!Array.isArray(this.date) || this.date.length < 2 || !this.date[0] || !this.date[1]) {
        this.notification.create('warning', 'Date Range Required', 'Please select both start and end dates.');
        this.isSpinning = false;
        return;
    }

    const startDate = this.date[0];
    const endDate = this.date[1];

    const data = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        userId: this.userId
    };
    
    console.log(data);
    this.visitedCustomerService.get(data).subscribe(
        (res: APIResponse) => {
            this.customerRecord = res.data;
            this.filteredData = res.data;
            this.caltotals();
            this.isSpinning = false;
        },
        (error) => {
            this.notification.create('error', 'Error', error.error?.message || 'Something went wrong!');
            this.isSpinning = false;
        }
    );
}




}
