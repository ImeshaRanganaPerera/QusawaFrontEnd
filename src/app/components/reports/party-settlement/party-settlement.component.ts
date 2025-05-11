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

@Component({
  selector: 'app-party-settlement',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './party-settlement.component.html',
  styleUrl: './party-settlement.component.scss'
})
export class PartySettlementComponent {
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
  totalsettlement: number = 0;
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

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  ngOnInit(): void {
    this.rolebase()
    this.setupSearch()
    this.getUser();
    this.route.queryParams.subscribe(params => {
      this.type = params['type'];
      if (this.type === 'Customer Settlement') {
        this.partytype = 'CUSTOMER'
        this.voucherType = 'INVOICE'
        this.getvoucher(this.voucherType);
        this.getParty(this.partytype);
      }
      else {
        // this.partytype = 'SUPPLIER'
        // this.voucherType = 'GRN'
        // this.getvoucher(this.voucherType);
        // this.getParty(this.partytype);
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
        records.party.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

    this.voucherService.getSettlement(voucherGrp, partyId, userId).subscribe((res: APIResponse) => {
      this.dataSource = res.data;
      this.filteredData = res.data;
      console.log(this.dataSource)
      this.isSpinning = false;

      this.totalcalulate();

    }, (error) => {
      this.isSpinning = false;
    })
  }

  totalcalulate() {
    this.totalAmount = 0;
    this.totalpaidValue = 0;
    this.totalsettlement = 0;
    this.filteredData.forEach((item: any) => {
      this.totalAmount += Number(item.amount);
      this.totalpaidValue += Number(item.paidValue); 
      this.totalsettlement += Number(item.paidValue);
    });
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
