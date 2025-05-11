import { Component, inject, ViewContainerRef } from '@angular/core';
import { MaterialModule } from '../../../../modules/material/material.module';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CenterService } from '../../../../services/center/center.service';
import { InventoryService } from '../../../../services/inventory/inventory.service';
import { PartyService } from '../../../../services/party/party.service';
import { VoucherService } from '../../../../services/voucher/voucher.service';
import { IUserCenter, IParty, APIResponse, ITableRow, ICenter } from '../../../../shared/interface';
import { ActivatedRoute } from '@angular/router';
import { differenceInCalendarDays } from 'date-fns';
import { RefVouchersComponent } from '../../../../shared/ref-vouchers/ref-vouchers.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { PdfSelectionComponent } from '../../../../shared/pdf-selection/pdf-selection.component';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-manage-vouchers',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './manage-vouchers.component.html',
  styleUrl: './manage-vouchers.component.scss'
})
export class ManageVouchersComponent {
  isSpinning = false;
  searchControl: FormControl = new FormControl('');
  filteredData: any[] = [];
  dataSource: any[] = [];
  centerData: IUserCenter[] = [];
  allcenterdata: ICenter[] = [];
  partyData: IParty[] = [];
  productData: any[] = [];
  filteredProducts: any[] = [];
  params: any;
  today = new Date();
  role: any;

  inputValue?: string;
  totalAmount: number = 0;
  responseMessage: any;
  voucherType: any;
  isconform: boolean = true;
  paidAmount: number = 0;
  current: number = 0;

  notification = inject(NzNotificationService)
  voucherservice = inject(VoucherService)
  centerservice = inject(CenterService)
  partyservice = inject(PartyService)
  modal = inject(NzModalService)
  viewContainerRef = inject(ViewContainerRef)
  inverntoryservice = inject(InventoryService)
  route = inject(ActivatedRoute)

  disabledDate = (current: Date): boolean =>
    // Can not select days before today and today
    differenceInCalendarDays(current, this.today) > 0;

  voucherForm: FormGroup = new FormGroup({
    date: new FormControl('', [Validators.required]),
    voucherNumber: new FormControl({ value: '', disabled: true }),
    centerId: new FormControl(''),
    partyId: new FormControl(''),
    amount: new FormControl(''),
    refNumber: new FormControl(''),
    location: new FormControl(''),
    fromCenterId: new FormControl(''),
    toCenterId: new FormControl(''),
    directvoucherNumber: new FormControl(''),
  })
  refVoucherNumber: any;

  ngOnInit(): void {
    this.getRole()
    this.voucherForm.get('date')?.setValue(this.today);
    this.route.queryParams.subscribe(params => {
      this.params = params['type'];
    })

    if (this.params === 'GRN') {
      this.voucherType = 'GRN'
      this.getParty('SUPPLIER');
      this.getVoucherNumber(this.voucherType);
      this.isconform = false;
      this.voucherForm.get('partyId')?.setValidators([Validators.required]);
      this.voucherForm.get('partyId')?.updateValueAndValidity();
      this.voucherForm.get('centerId')?.valueChanges.subscribe(centerId => {
        if (centerId) {
          this.isSpinning = true;
          this.getProduct(centerId);
        }
      });
      this.voucherForm.get('partyId')?.valueChanges.subscribe(partyId => {
        if (partyId) {
          this.isSpinning = true;
          this.getRefVouchers('PURCHASE-ORDER', partyId)
          this.getRefVouchers('DIRECT PAYMENT', partyId)
          this.voucherForm.get('directvoucherNumber')?.valueChanges.subscribe(voucherNumber => {
            if (voucherNumber) {
              this.refVoucherNumber = voucherNumber;
              const selectedDirectPayment = this.directPayment.find((payment: any) => payment.voucherNumber === voucherNumber);
              if (selectedDirectPayment) {
                this.paidAmount = selectedDirectPayment.amount; // Get the amount of the selected direct payment
                this.isconform = true;
                console.log(this.paidAmount);
              } else {
                console.log('Selected voucher number not found in direct payments');
              }
              console.log(this.refVoucherNumber)
            }
          })
          this.isSpinning = false;
        }
      });
    }
    if (this.params === 'Purchase Return') {
      this.voucherType = 'PURCHASE-RETURN'
      this.getParty('SUPPLIER');
      this.voucherForm.get('partyId')?.setValidators([Validators.required]);
      this.voucherForm.get('partyId')?.updateValueAndValidity();

      this.getVoucherNumber(this.voucherType);
      this.voucherForm.get('centerId')?.valueChanges.subscribe(centerId => {
        if (centerId) {
          this.isSpinning = true;
          this.getProduct(centerId);
        }
      });
      this.voucherForm.get('partyId')?.valueChanges.subscribe(partyId => {
        if (partyId) {
          this.isSpinning = true;
          this.getRefVouchers('GRN', partyId)
        }
      })
    }
    if (this.params === 'Purchase Order') {
      this.voucherType = 'PURCHASE-ORDER'
      this.voucherForm.get('partyId')?.setValidators([Validators.required]);
      this.voucherForm.get('partyId')?.updateValueAndValidity();
      this.getParty('SUPPLIER');
      this.getVoucherNumber(this.voucherType);
      this.voucherForm.get('centerId')?.valueChanges.subscribe(centerId => {
        if (centerId) {
          this.isSpinning = true;
          this.getProduct(centerId);
        }
      });
    }
    if (this.params === 'Stock Transfer') {
      if (this.role === 'SALESMEN') {
        this.getPhysicalCenter();
      }
      else {
        this.getallCenter();
      }
      this.voucherType = 'STOCK-TRANSFER'
      this.voucherForm.get('fromCenterId')?.setValidators([Validators.required]);
      this.voucherForm.get('toCenterId')?.setValidators([Validators.required]);

      this.voucherForm.get('fromCenterId')?.updateValueAndValidity();
      this.voucherForm.get('toCenterId')?.updateValueAndValidity();
      this.getVoucherNumber(this.voucherType);
      this.voucherForm.get('fromCenterId')?.valueChanges.subscribe(centerId => {
        if (centerId) {
          this.isSpinning = true;
          this.getProduct(centerId);
        }
      });
    }
    if (this.params === 'Stock Verification') {
      if (this.role === 'SALESMEN') {
        this.getPhysicalCenter();
      }
      else {
        this.getallCenter();
      }
      this.voucherType = 'STOCK-VERIFICATION' 
/*       this.voucherForm.get('fromCenterId')?.setValidators([Validators.required]); */
   /*    this.voucherForm.get('toCenterId')?.setValidators([Validators.required]); */

  /*     this.voucherForm.get('fromCenterId')?.updateValueAndValidity();
      this.voucherForm.get('toCenterId')?.updateValueAndValidity(); */
      this.getVoucherNumber(this.voucherType);
      this.voucherForm.get('centerId')?.valueChanges.subscribe(centerId => {
        if (centerId) {
          this.isSpinning = true;
          this.getProduct(centerId);
        }
      });
    }
    this.getCenter();
  }

  getRole() {
    this.role = localStorage.getItem('role')
  }

  directPayment: any[] = []

  getRefVouchers(vouchergrp: any, partyId: any) {
    this.voucherservice.getRefVoucherbyVoucherGrp(vouchergrp, partyId).subscribe((res: APIResponse) => {
      console.log(res.data)
      if (res.data.length > 0) {
        if (vouchergrp === 'PURCHASE-ORDER') {
          this.refVoucher(res.data)
          this.isSpinning = false;
        }
        else {
          this.directPayment = res.data
          console.log(this.directPayment)
          this.isSpinning = false;
        }
      }
      console.log('hi')
    })
    this.isSpinning = false;
  }

  refVoucher(data: any) {
    const modal = this.modal.create({
      nzContent: RefVouchersComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzWidth: "700px",
      nzFooter: [],
      nzData: { data: data },
    })
    modal.afterClose.subscribe((result: any) => {
      if (result && result.data) {
        this.dataSource = result.data.voucherProduct.map((product: any) => ({
          ...product,
          printName: product.product?.printName
        }));
        console.log(this.dataSource)
        this.refVoucherNumber = result.data.voucherNumber;
        console.log(this.refVoucherNumber)
        this.calculateTotalAmount();
      }
      else {
        this.notification.create('info', 'Info', 'No changes were made.')
      }
    });
  }

  getVoucherNumber(name: any) {
    this.voucherservice.getVoucherNumber(name).subscribe((res: APIResponse) => {
      this.voucherForm.get('voucherNumber')?.setValue(res.data)
      this.isSpinning = false;
    })
  }

  getParty(partyName: any) {
    this.partyservice.getbygroup(partyName, true).subscribe((res: APIResponse) => {
      this.partyData = res.data;
      this.isSpinning = false;
    }, (error) => {
      // this.notification.create('error', 'Error', error.error?.message || 'Something went wrong!')
    })
  }

  getCenter() {
    this.centerservice.getCenterbyUser().subscribe((res: APIResponse) => {
      this.centerData = res.data;
      this.isSpinning = false;
    })
  }

  getPhysicalCenter() {
    this.centerservice.getbycentermode('PHYSICAL').subscribe((res: APIResponse) => {
      this.allcenterdata = res.data;
    })
  }

  getallCenter() {
    this.centerservice.get().subscribe((res: APIResponse) => {
      this.allcenterdata = res.data;
      this.isSpinning = false;
    })
  }

  getProduct(centerId: string) {
    this.inverntoryservice.getbyCenterId(centerId).subscribe((res: any) => {
      this.productData = res.data.map((product: any) => ({
        ...product.product,
        ...product
      }));
      this.filteredProducts = [...this.productData];
      console.log(this.filteredProducts)
      this.isSpinning = false;
    }, (error) => {
      this.notification.create('error', 'Error', error.error?.message || 'Something went wrong!');
    });
  }

  onInput(e: Event): void {
    const value = (e.target as HTMLInputElement).value;
    this.filteredProducts = this.productData.filter(product =>
      product.printName.toLowerCase().includes(value.toLowerCase()) ||
      product.itemCode.toString().includes(value.toLowerCase())
    );
  }

  onadd() {
    const selectedProduct = this.productData.find(
      product => product.printName === this.inputValue
    );
    console.log(selectedProduct.quantity)

    if (selectedProduct) {
      const newRow: ITableRow = {
        printName: selectedProduct.printName,
        productName: selectedProduct.printName,
        productId: selectedProduct.id,
        cost: parseFloat(selectedProduct.cost).toFixed(2),
        currentStock: selectedProduct.quantity,
        discount: "0",
        quantity: 0,
        sellingPrice: 0,
        minPrice: 0,
        MRP: selectedProduct.MRP,
        amount: 0
      };
      this.dataSource = [...this.dataSource, newRow];
      this.inputValue = ''; // Clear the input after adding
    }
    else {
      this.notification.create('error', 'Error', "Product is unavailable")
    }
  }

  // Calculate amount automatically whenever cost or qty changes
  onFieldChange(row: any, field: string, value: any) {
    row[field] = value;

    // If the field is 'MRP', update the selling price as well
    if (field === 'MRP') {
      row.sellingPrice = value;
      row.minPrice = value
    }

    // If the cost or quantity changes, update the amount
    if (field === 'cost' || field === 'quantity') {
      this.updateAmount(row);
    }

    // If the discount changes, adjust the amount
    if (field === 'discount') {
      this.applyDiscount(row);
    }
  }

  // Calculate amount based on cost and quantity
  updateAmount(row: ITableRow) {
    row.amount = row.cost * row.quantity;
    this.applyDiscount(row); // Apply discount after calculating the base amount
    this.calculateTotalAmount();
  }

  // Apply discount based on input (either fixed or percentage)
  applyDiscount(row: any) {
    let discount = row.discount;
    let amount = row.cost * row.quantity; // Base amount before discount

    // Check if discount contains a percentage symbol
    if (typeof discount === 'string' && discount.includes('%')) {
      // Extract the percentage value and apply it
      const percentage = parseFloat(discount.replace('%', ''));
      row.amount = amount - (amount * (percentage / 100));
    } else {
      // Assume a fixed discount if no percentage symbol
      const fixedDiscount = parseFloat(discount) || 0;
      row.amount = Math.max(0, amount - fixedDiscount); // Ensure amount does not go negative
    }
    this.calculateTotalAmount();
  }

  calculateTotalAmount() {
    this.totalAmount = this.dataSource.reduce((sum, row) => sum + row.amount, 0);
  }

  ondelete(product: any) {
    this.dataSource = this.dataSource.filter(m => m !== product);
    this.calculateTotalAmount();
    this.notification.create('info', 'Removed', "Product removed")
  }

  getCurrentLocation(): Promise<GeolocationCoordinates> {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => resolve(position.coords),
          error => reject(error)
        );
      } else {
        reject(new Error('Geolocation is not supported by this browser.'));
      }
    });
  }

  async submit() {
    try {
      if (this.voucherForm.invalid) {
        Object.values(this.voucherForm.controls).forEach(control => {
          if (control.invalid) {
            control.markAsDirty();
            control.updateValueAndValidity({ onlySelf: true });
          }
        })
        return;
      }

      for (const row of this.dataSource) {
        const product = this.productData.find(p => p.id === row.productId);
        if (product && row.quantity === 0) {
          this.notification.create(
            'error',
            'Quantity Error',
            `The quantity for ${row.productName} has to be above 0`
          );
          return; // Stop submission
        }

        if (this.voucherType === 'STOCK-TRANSFER') {
          if (product && row.quantity > product.quantity) {
            this.notification.create(
              'error',
              'Quantity Error',
              `The quantity for ${row.productName} exceeds available stock. Maximum available: ${product.quantity}.`
            );
            return; // Stop submission
          }
        }

        if (product && row.cost === 0) {
          this.notification.create(
            'error',
            'Quantity Error',
            `The Cost for ${row.productName} has to be above 0`
          );
          return; // Stop submission
        }
      }

      this.isSpinning = true;
      const coords = await this.getCurrentLocation();
      const location = `Latitude: ${coords.latitude}, Longitude: ${coords.longitude}`;

      // Add location to form data or process as needed
      this.voucherForm.get('location')?.setValue(location);
      var formData = this.voucherForm.value;

      if (!(this.dataSource && this.dataSource.length > 0)) {
        this.notification.create('error', 'Error', 'Product list is empty');
        this.isSpinning = false;
        return;
      }

      if (this.voucherType === 'STOCK-TRANSFER') {
        if (formData.fromCenterId === formData.toCenterId) {
          this.notification.create('error', 'Error', 'Center should not be same');
          this.isSpinning = false;
          return;
        }
      }

      var data;

      if (this.params === 'GRN') {
        data = {
          date: formData.date,
          voucherNumber: formData.voucherNumber,
          centerId: formData.centerId,
          partyId: formData.partyId || null,
          amount: this.totalAmount,
          isPayment: false,
          location: formData.location,
          paidValue: this.refVoucherNumber ? this.paidAmount : 0,
          refVoucherNumber: this.refVoucherNumber || null,
          refNumber: formData.refNumber,
          isRef: this.refVoucherNumber ? true : false,
          isconform: this.isconform,
          stockStatus: true,
          voucherGroupname: this.voucherType,
          fromCenterId: formData.fromCenterId,
          toCenterId: formData.toCenterId,
          productList: this.dataSource,
          journalEntries: [
            {
              accountId: 'INVENTORY',
              debit: this.totalAmount,
              credit: 0,
            },
            {
              accountId: 'IMPORT',
              debit: 0,
              credit: this.totalAmount,
            }
          ],
        }
      }
      else if (this.params === 'Purchase Return') {
        data = {
          date: formData.date,
          voucherNumber: formData.voucherNumber,
          centerId: formData.centerId,
          partyId: formData.partyId || null,
          amount: this.totalAmount,
          location: formData.location,
          returnValue: this.totalAmount,
          isPayment: false,
          stockStatus: true,
          paidValue: this.refVoucherNumber ? this.paidAmount : 0,
          refVoucherNumber: this.refVoucherNumber || null,
          refNumber: formData.refNumber,
          isRef: this.refVoucherNumber ? true : false,
          isconform: this.isconform,
          voucherGroupname: this.voucherType,
          fromCenterId: formData.fromCenterId,
          toCenterId: formData.toCenterId,
          productList: this.dataSource,
          journalEntries: [
            {
              accountId: 'IMPORT',
              debit: this.totalAmount,
              credit: 0,
            },
            {
              accountId: 'INVENTORY',
              debit: 0,
              credit: this.totalAmount,
            }
          ],
        }
      }
      else if (this.params !== 'Stock Verification'){
        data = {
          date: formData.date,
          voucherNumber: formData.voucherNumber,
          centerId: formData.centerId,
          partyId: formData.partyId || null,
          amount: this.totalAmount,
          isPayment: false,
          location: formData.location,
          paidValue: this.refVoucherNumber ? this.paidAmount : 0,
          refVoucherNumber: this.refVoucherNumber || null,
          refNumber: formData.refNumber,
          isRef: this.refVoucherNumber ? true : false,
          isconform: this.isconform,
          stockStatus: this.params === 'Purchase Order' ? false : true,
          voucherGroupname: this.voucherType,
          fromCenterId: formData.fromCenterId,
          toCenterId: formData.toCenterId,
          productList: this.dataSource,
        }
      }
      else if (this.params === 'Stock Verification'){
        data = {
          date: formData.date,
          voucherNumber: formData.voucherNumber,
          centerId: formData.centerId,
          partyId: formData.partyId || null,
          amount: this.totalAmount,
          isPayment: false,
          location: formData.location,
          paidValue: this.refVoucherNumber ? this.paidAmount : 0,
          refVoucherNumber: this.refVoucherNumber || null,
          refNumber: formData.refNumber,
          isRef: this.refVoucherNumber ? true : false,
          isconform: this.isconform,
          stockStatus: true,
          voucherGroupname: this.voucherType,
          fromCenterId: formData.fromCenterId,
          toCenterId: formData.toCenterId,
          productList: this.dataSource,
        }
      }
      if (this.params !== 'Stock Verification') {
      this.voucherservice.create(data).subscribe((res: APIResponse) => {
        this.responseMessage = res.message
        this.isSpinning = false;
        this.resetForm()
        this.notification.create('success', 'Success', this.responseMessage);
        console.log(res.data)
        this.printoutSelection(res.data, this.voucherType);
      }, (error) => {
        this.responseMessage = error.error?.message || 'Something went wrong!'
        this.isSpinning = false;
        this.notification.create('error', 'Error', this.responseMessage);
      })
    }
    else{
      this.voucherservice.PostStockVerification(data).subscribe((res: APIResponse) => {
        this.responseMessage = res.message
        this.isSpinning = false;
        this.resetForm()
        this.notification.create('success', 'Success', this.responseMessage);
        console.log(res.data)
        this.printoutSelection(res.data, this.voucherType);
      }, (error) => {
        this.responseMessage = error.error?.message || 'Something went wrong!'
        this.isSpinning = false;
        this.notification.create('error', 'Error', this.responseMessage);
      })
    }
    } catch (error) {
      console.error('Error getting location:', error);
      this.isSpinning = false;
      this.notification.create('error', 'Error', 'Failed to get current location.');
    }
  }

  getChartofAccIdFromParty(partyId: string) {
    const party = this.partyData.find(p => p.id === partyId);
    return party?.chartofAccountId || null;
  }

  printoutSelection(data: any, type: any) {
    const modal = this.modal.create({
      nzContent: PdfSelectionComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzWidth: "700px",
      nzFooter: [],
      nzData: { data: data, type: type },
    })
    modal.afterClose.subscribe((result: any) => {
      if (result && result.data) {

      }
      else {
        this.notification.create('info', 'Info', 'No changes were made.')
      }
    });
  }

  resetForm() {
    this.isSpinning = true;
    this.voucherForm.reset();
    this.voucherForm.get('date')?.setValue(this.today);
    this.dataSource = [];
    this.filteredData = [];
    this.productData = [];
    this.filteredProducts = [];
    this.getVoucherNumber(this.voucherType);
    this.totalAmount = 0;
    this.isconform = false;
    this.directPayment = [];
  }

  cancel(): void {
    this.nzMessageService.info('click cancel');
  }

  constructor(private nzMessageService: NzMessageService) { }
}
