import { Component, inject, ViewContainerRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { PartyService } from '../../../../services/party/party.service';
import { IParty, APIResponse } from '../../../../shared/interface';
import { ManageCustomerComponent } from '../manage-customer/manage-customer.component';
import { MaterialModule } from '../../../../modules/material/material.module';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [MaterialModule],
  providers: [DatePipe],
  templateUrl: './customer-list.component.html',
  styleUrl: './customer-list.component.scss'
})
export class CustomerListComponent {
  isSpinning = true;
  searchControl: FormControl = new FormControl('');
  dataSource1: any[] = [];
  dataSource2: any[] = [];
  filteredData1: any[] = [];
  filteredData2: any[] = [];
  mode: any = 'true';
  role: any;
  blocked: boolean = false;
  categoryList: any = [];
  cityList: any = [];
  selectedCity: any
  selectedCategory: any
  ischecked: boolean = true;

  //services
  model = inject(NzModalService);
  viewContainerRef = inject(ViewContainerRef);
  notification = inject(NzNotificationService);
  partyservice = inject(PartyService);
  datePipe = inject(DatePipe);

  currentPage = 1;
  pageSize = 100;

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  ngOnInit(): void {
    this.getCustomer(true);
    this.getCustomer(false);
    this.setupSearch();
    this.rolebase();
    this.getCategory();
  }

  // Compute the counts for dataSource1 and dataSource2
  get dataSource1Count(): number {
    return this.filteredData1.length;
  }

  get dataSource2Count(): number {
    return this.filteredData2.length;
  }

  rolebase() {
    this.role = localStorage.getItem('role');
    if (this.role === 'SALESMEN') {
      this.blocked = true;
    }
  }

  getCategory() {
    this.partyservice.getpartyCategory().subscribe((res: APIResponse) => {
      this.categoryList = res.data;
      this.isSpinning = false;
    })
  }

  getCustomer(condition: any) {
    this.partyservice.getbygroup('CUSTOMER', condition).subscribe((res: APIResponse) => {
      if (condition === true) {
        if (this.dataSource1.length === 0) {
          this.dataSource1 = res.data;
          this.filteredData1 = res.data;
          console.log(this.filteredData1)
          this.cityList = [...new Set(this.filteredData1.map(record => record.city).filter(city => city))];
        }
      } else {
        if (this.dataSource2.length === 0) {
          this.dataSource2 = res.data;
          this.filteredData2 = res.data;
        }
      }
      this.isSpinning = false;
    }, (error) => {
      this.notification.create('error', 'Error', error.error?.message || 'Something went wrong!');
    });
  }

  onTabClick(condition: any) {
    this.mode = condition;
    if (this.mode === 'true') {
      this.setupSearch();
      this.currentPage = 1;
      this.pageSize = 100;
    } else {
      this.getCustomer(false);
      this.setupSearch();
      this.currentPage = 1;
      this.pageSize = 100;
    }
  }

  clickSwitch() {
    this.ischecked = !this.ischecked;
  }

  filterData(data: any[]): any[] {
    const searchTermLower = this.searchControl.value ? this.searchControl.value.toLowerCase() : '';
    const selectedCityLower = this.selectedCity ? this.selectedCity.toLowerCase() : '';
    const selectedCategory = this.selectedCategory;

    return data.filter((party: any) => {
      // Filter by search term
      const matchesSearchTerm = (
        (party.name && party.name.toLowerCase().includes(searchTermLower)) ||
        (party.address1 && party.address1.toLowerCase().includes(searchTermLower)) ||
        (party.email && party.email.toLowerCase().includes(searchTermLower)) ||
        (party.userName && party.userName.toLowerCase().includes(searchTermLower)) ||
        (party.phoneNumber && party.phoneNumber.toString().includes(searchTermLower)) ||
        (party.nic && party.nic.toString().includes(searchTermLower))
      );

      // Filter by selected city
      const matchesCity = selectedCityLower ? (party.city && party.city.toLowerCase() === selectedCityLower) : true;

      // Filter by selected category
      const matchesCategory = selectedCategory ? (party.partyCategory?.category === selectedCategory) : true;

      // Return true if it matches all criteria
      return matchesSearchTerm && matchesCity && matchesCategory;
    });
  }

  setupSearch() {
    // Subscribe to search term changes
    this.searchControl.valueChanges.subscribe(() => {
      this.applyFilters();
    });

    // Initial call to apply filters
    this.applyFilters();
  }

  // Function to handle city and category changes
  onchange() {
    this.applyFilters();
  }

  // Method to apply filters based on mode
  applyFilters() {
    if (this.mode === 'true') {
      this.filteredData1 = this.filterData(this.dataSource1);
    } else {
      this.filteredData2 = this.filterData(this.dataSource2);
    }
  }

  exportToCSV() {
    const csvRows = [];

    // Add headers
    csvRows.push(['Customer Name', 'Category', 'Phone Number', 'BR/NIC', 'Address', 'City', 'Created By'].join(','));

    // Add data rows
   
    (this.mode === 'true' ? this.filteredData1 : this.filteredData2).forEach(data => {
      const row = [
        this.escapeCsvField(data.name),
        this.escapeCsvField(data.partyCategory?.category),
        this.escapeCsvField(data.phoneNumber),
        this.escapeCsvField(data.nic),
        this.escapeCsvField(data.address1),
        this.escapeCsvField(data.city),
        this.escapeCsvField(data.userName)
      ];
      csvRows.push(row.join(','));
    });

    // Combine all rows
    const csvString = csvRows.join('\n');

    // Create CSV Blob and trigger download
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `Customer Detail.csv`);
    a.click();+

    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  // Helper function to escape CSV fields correctly
  escapeCsvField(field: string | undefined): string {
    if (field === undefined || field === null) {
      return '';  // Return empty string for null or undefined fields
    }

    // Escape commas, quotes, and newlines
    const escapedField = field.replace(/"/g, '""');  // Escape double quotes
    return `"${escapedField}"`;  // Wrap field in quotes
  }


  manageCustomer(action: string, data?: any) {
    const modal = this.model.create({
      nzContent: ManageCustomerComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzWidth: "700px",
      nzFooter: [],
      nzData: { data: data, action: action },
    });
    modal.afterClose.subscribe((result: any) => {
      if (result && result.message) {
        if (action === 'Create' && result.data) {
          this.dataSource2 = [result.data, ...this.dataSource2];
        } else if (action === 'Update' && result.data) {
          console.log(result.data);
          if (this.role === 'SALESMEN') {
            this.dataSource1 = this.dataSource1.filter(item => item.id !== result.data.id);
          }
          else {
            const index = this.dataSource1.findIndex(item => item.id === result.data.id);
            if (index !== -1) {
              this.dataSource1[index] = result.data;
            }
          }

          this.filteredData1 = [...this.dataSource1];
        }
        else if (action === 'Approval' && result.data) {
          // Remove the customer from dataSource2
          console.log(this.dataSource2);
          this.dataSource2 = this.dataSource2.filter(item => item.id !== result.data.id);

          // Add the approved customer to dataSource1
          this.dataSource1 = [result.data, ...this.dataSource1];
          console.log(this.dataSource1);

          // Update filtered data arrays
          this.filteredData1 = [...this.dataSource1];
          this.filteredData2 = [...this.dataSource2];
        }
        this.filteredData2 = [...this.dataSource2];
        this.notification.create('success', 'Success', result.message);
      } else {
        this.notification.create('info', 'Info', 'No changes were made.');
      }
    });
  }

  handleEdit(data: any) {
    if (this.mode === 'true') {
      this.manageCustomer('Update', data);
    } else {
      this.manageCustomer('Approval', data);
    }
  }
}
