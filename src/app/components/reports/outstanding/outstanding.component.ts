import { Component, inject, ViewContainerRef } from '@angular/core';
import { MaterialModule } from '../../../modules/material/material.module';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { PartyService } from '../../../services/party/party.service';
import { UserService } from '../../../services/user/user.service';
import { VoucherService } from '../../../services/voucher/voucher.service';
import { APIResponse } from '../../../shared/interface';
import { ReportSelectionComponent } from '../../vouchers/transaction/report-selection/report-selection/report-selection.component';
import { VoucherProductService } from '../../../services/voucherProduct/voucher-product.service';


@Component({
  selector: 'app-outstanding',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './outstanding.component.html',
  styleUrl: './outstanding.component.scss'
})
export class OutstandingComponent {
  isSpinning = true;
  isSpinning2 = false;
  searchControl: FormControl = new FormControl('');
  dateRange!: FormGroup;
  dataSource: any[] = [];
  filteredData: any[] = [];
  voucherProduct: any[] = [];
  userList: any[] = [];
  partyList: any[] = [];
  type: any;
  partytype: any;
  voucherType: any;
  role: any;
  isBlocked: boolean = false;
  totalAmount: number = 0;
  totalOutstanding: number = 0;
  totalpaidValue: number = 0;

  modal = inject(NzModalService);
  viewContainerRef = inject(ViewContainerRef);
  notification = inject(NzNotificationService);
  voucherService = inject(VoucherService);
  userService = inject(UserService);
  partyService = inject(PartyService);
  route = inject(ActivatedRoute);

  outstandingForm: FormGroup = new FormGroup({
    partyId: new FormControl(''),
    userId: new FormControl(''),
  })

  currentPage = 1;
  pageSize = 100;
  datePipe: any;
  voucherGrp: any;

  onPageChange(page: number): void {
    this.currentPage = page;
  }


  ngOnInit(): void {
    this.rolebase()
    this.setupSearch()
    this.getUser();
    this.route.queryParams.subscribe(params => {
      this.type = params['type'];
      if (this.type === 'Customer Outstanding') {
        this.partytype = 'CUSTOMER'
        this.voucherType = 'INVOICE'
        this.getvoucher(this.voucherType);
        this.getParty(this.partytype);
      }
      else {
        this.partytype = 'SUPPLIER'
        this.voucherType = 'GRN'
        this.getvoucher(this.voucherType);
        this.getParty(this.partytype);
      }
    });
  }

  rolebase() {
    this.role = localStorage.getItem('role');
    console.log(this.role)
    if (this.role === 'SALESMEN') {
      this.isBlocked = true
    }
  }

  applyDateFilter() {
    var partyid = this.outstandingForm.get('partyId')?.value;
    var userId = this.outstandingForm.get('userId')?.value;
    this.isSpinning = true;
    this.getvoucher(this.voucherType, partyid, userId)
  }

  setupSearch() {
    this.searchControl.valueChanges.subscribe((searchTerm) => {
      this.filteredData = this.dataSource.filter((records: any) =>
        records.party.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        records.voucherNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        records.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
        records.amount.toLowerCase().includes(searchTerm.toLowerCase())
      );
      this.totalcalulate()
    });
  }

  getParty(partyGrp: any) {
    this.partyService.getbygroup(partyGrp, true).subscribe((res: APIResponse) => {
      this.partyList = res.data;
    })
  }

  getvoucher(voucherGrp: any, partyId?: any, userId?: any,) {
    this.dataSource = [];
    this.filteredData = [];

    // this.voucherService.getOutstanding(voucherGrp, partyId, userId).subscribe((res: APIResponse) => {
    //   this.dataSource = res.data;
    //   this.filteredData = res.data;
    //   this.dataSource = res.data.map((item) => ({
    //     ...item,
    //     outstandingAmount: item.amount - item.paidValue, // Adjust the calculation based on available fields
        
    //   }));

    this.voucherService.getOutstanding(voucherGrp, partyId, userId).subscribe(
      (res: APIResponse) => {
        this.dataSource = res.data.map((item) => {
          const dueDays = item.dueDays || 30; // Default due period if not provided
          const invoiceDate = new Date(item.date); // Convert to Date object
          const dueDate = new Date(invoiceDate);
          dueDate.setDate(invoiceDate.getDate()); // Add due days to invoice date
  
          const today = new Date();
          const timeDiff = today.getTime() - dueDate.getTime();
          const daysDue = Math.ceil(timeDiff / (1000 * 3600 * 24)); // Convert milliseconds to days
  
          return {
            ...item,
            outstandingAmount: item.amount - item.paidValue, // Adjust calculation as needed
            dueDate: dueDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
            daysOverdue: daysDue > 0 ? daysDue : 0, // Only show overdue days (avoid negative values)
          };
        });

      this.filteredData = [...this.dataSource];

    
      console.log(this.filteredData)
      this.isSpinning = false;

      this.totalcalulate();

    }, (error) => {
      this.isSpinning = false;
    })
  }

  calculateDueDays(invoiceDate: string, dueDays: number): number {
    const invoiceDateObj = new Date(invoiceDate);
    const dueDate = new Date(invoiceDateObj);
    dueDate.setDate(dueDate.getDate());

    // Set both dates to midnight to ignore time
    dueDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const timeDifference = today.getTime() - dueDate.getTime();
    const remainingDueDays = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

    return remainingDueDays > 0 ? remainingDueDays : 0;
  }

  totalcalulate() {
    this.totalAmount = 0;
    this.totalpaidValue = 0;
    this.totalOutstanding = 0;
    this.filteredData.forEach((item: any) => {
      this.totalAmount += Number(item.amount); // Assuming `amount` is the total amount
      this.totalpaidValue += Number(item.paidValue); // Assuming `amount` is the total amount
      this.totalOutstanding += (item.amount - item.paidValue); // Calculate outstanding amount
    });
  }

  calculateOutstanding(amount: number, paidValue: number | null, returnValue: number | null, value?: number | null): number {
    const paid = paidValue ?? 0;   // If paidValue is null or undefined, set it to 0
    const returned = returnValue ?? 0; // If returnValue is null or undefined, set it to 0
    const values = value ?? 0; // If returnValue is null or undefined, set it to 0

    var outstanding = 0;
    if (values > 0) {
      outstanding = Number(values) - (Number(paid) + Number(returned));
    } else {
      outstanding = Number(amount) - (Number(paid) + Number(returned));
    }
    return outstanding;

  }

  getUser() {
    this.userService.getbyRole('SALESMEN').subscribe((res: APIResponse) => {
      this.userList = res.data;
    })
  }

  reportSelection() {
    const modal = this.modal.create({
      nzContent: ReportSelectionComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzWidth: "900px",
      nzFooter: [],
      nzMaskClosable: false,
      nzClosable: false,
      nzData: {
        Data: this.filteredData,
      }
    });
  }

  getDiscountRate(discount: string | number, MRP: number): number {
    if (typeof discount === 'string' && discount.includes('%')) {
      const discountValue = parseFloat(discount.replace('%', ''));
      return MRP - (MRP * (discountValue / 100)); // MRP - percentage discount
    }
    // If discount is a number or string without '%', treat it as a fixed discount
    const fixedDiscount = typeof discount === 'number' ? discount : parseFloat(discount);
    return MRP - fixedDiscount; // Subtract fixed discount from MRP
  }

  getAmount(product: any): number {
    if (this.voucherType === 'GRN') {
      const rate = this.getDiscountRate(product.discount, product.cost);
      return rate * product.quantity; // Calculate total amount with the adjusted rate
    }
    else {
      const rate = this.getDiscountRate(product.discount, product.MRP);
      return rate * product.quantity; // Calculate total amount with the adjusted rate
    }
  }

  onExpandRow(data: any): void {
    console.log(data.voucherProduct);
    this.voucherProduct = data.voucherProduct;
  }

  exportsummaryToCSV() {
    const csvRows = [];
    csvRows.push(['Date', 'Invoice Number', 'Name of Customer', 'Days', 'Due Days', 'Return Amount','paid Amount','Invoice Amount','Outstanding','Sales Person'].join(','));

    this.filteredData.forEach(data => {
      csvRows.push([
       // this.datePipe.transform(data.date, 'yyyy/MM/dd') || '',
        data.voucherNumber || '',
        data.party?.name || 'N/A',  // Handle null customer name
        data.dueDays || '0',
        data.daysOverdue || '0',
        data.returnValue || '0',
        data.paidValue || '0',
        data.amount || '0',  // Handle null amount
        data.outstandingAmount || '0',
        data.user.role === 'ADMIN' ? 'ADMIN' :  (data.user?.name || 'N/A'),  // Handle null user
      ].join(','));

      // data.Invoices.forEach((invoice: any) => {
      //   csvRows.push([
      //     '',
      //     '',
      //     invoice.voucherNumber,
      //     this.datePipe.transform(invoice.date, 'yyyy/MM/dd') || '',
      //     invoice.voucherName,
      //     invoice.amount
      //   ].join(','));
      // });
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `${this.voucherGrp} Summary.csv`);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
  // pdfDownload(data: any) {
  //   if (this.category === 'Account') {
  //     const modal = this.modal.create({
  //       nzContent: ReceiptVoucherComponent,
  //       nzViewContainerRef: this.viewContainerRef,
  //       nzWidth: "900px",
  //       nzFooter: [],
  //       nzData: { data: data.id, type: this.type },
  //     })
  //     modal.afterClose.subscribe((result: any) => {
  //     });
  //   }
  //   if (this.type === 'Sales Return' || this.type === 'Invoice' || this.type === 'Sales Order' || this.type === 'GRN') {
  //     const modal = this.modal.create({
  //       nzContent: InvoicePdfComponent,
  //       nzViewContainerRef: this.viewContainerRef,
  //       nzWidth: "900px",
  //       nzFooter: [],
  //       nzData: { data: data.id, type: this.type },
  //     })
  //     modal.afterClose.subscribe((result: any) => {
  //     });
  //   }

  // }
}
