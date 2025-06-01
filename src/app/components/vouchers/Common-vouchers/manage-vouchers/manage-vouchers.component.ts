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
import { addDays, isBefore } from 'date-fns';
import { CurrencyService } from '../../../../services/currency/currency.service';
import { DialogboxComponent } from '../../../../dialogbox/dialogbox.component';
import { MatDialog } from '@angular/material/dialog';
import { lastValueFrom } from 'rxjs';


@Component({
  selector: 'app-manage-vouchers',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './manage-vouchers.component.html',
  styleUrl: './manage-vouchers.component.scss'
})
export class ManageVouchersComponent {
  localAmount: number = 0;
  usdAmount: string | null = null;
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
  dialog = inject(MatDialog)
  inputValue?: string;
  totalAmount: number = 0;
  responseMessage: any;
  voucherType: any;
  isconform: boolean = true;
  paidAmount: number = 0;
  current: number = 0;
  message = inject(NzMessageService)
  notification = inject(NzNotificationService)
  voucherservice = inject(VoucherService)
  centerservice = inject(CenterService)
  partyservice = inject(PartyService)
  modal = inject(NzModalService)
  viewContainerRef = inject(ViewContainerRef)
  inverntoryservice = inject(InventoryService)
  currencyservice = inject(CurrencyService)
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
          if (this.params === 'Stock Transfer') {
            this.getProductExpWise(centerId);
          }
          else {
            this.getProduct(centerId);
          }

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
          // this.getProduct(centerId);
          this.getProductExpWise(centerId);
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
          if (this.params === 'Stock Transfer') {
            this.getProductExpWise(centerId);
          }
          else {
            this.getProduct(centerId);
          }
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
  removeRow(index: number): void {
    this.dataSource.splice(index, 1);
    this.dataSource = [...this.dataSource]; // Update view
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
  checkIfDateHasEnoughDaysLeft(dateString: string, minDays: number): boolean {
    if (dateString.startsWith("025")) {
      dateString = "202" + dateString.substring(1);
    }
    const expiryDate = new Date(dateString);

    // Strip time from today
    const today = new Date();
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const timeDiff = expiryDate.getTime() - todayDateOnly.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    return dayDiff >= minDays;
  }
  sanitizeDateString(dateStr: string): string {
    // Fix malformed year (e.g. "025" → "2025")
    if (dateStr.length >= 24 && dateStr.startsWith('025')) {
      dateStr = '202' + dateStr.substring(1);
    }
    return dateStr;
  }
  getDateOnlyFromString(dateStr: string): string {
    const sanitized = this.sanitizeDateString(dateStr);
    const date = new Date(sanitized);

    // Format to YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
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
    this.inverntoryservice.getproduct().subscribe((res: any) => {
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

  getProductExpWise(centerId: string) {
    this.inverntoryservice.getbyCenterId(centerId).subscribe((res: any) => {
      this.productData = res.data.map((product: any) => ({
        ...product.product,
        ...product,
        expdate: product.expDate
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
    if (this.params === 'Stock Transfer' || this.params === 'Purchase Return' || this.params === 'Stock Verification') {
      const selectedProduct = this.productData.find(
        product =>
          product.batchNo === this.inputValue
      )
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
          amount: 0,
          batchNo: selectedProduct.batchNo,
          ExpnotifDays: selectedProduct.ExpnotifDays,
          expiryDate: selectedProduct.expDate,
          Packsize: selectedProduct.Packsize,
          Manufacture: selectedProduct.Manufacture,
          country: selectedProduct.country,
          usdRate:"0",
          mfdate:selectedProduct.mfdate,
        };
        this.dataSource = [...this.dataSource, newRow];
        this.inputValue = ''; // Clear the input after adding
      }
      else {
        this.notification.create('error', 'Error', "Product is unavailable")
      }
    }
    else {
      const selectedProduct = this.productData.find(
        product =>
          product.printName === this.inputValue
      )
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
          amount: 0,
          batchNo: selectedProduct.batchNo,
          ExpnotifDays: selectedProduct.ExpnotifDays,
          expiryDate: selectedProduct.expDate,
          Packsize: selectedProduct.Packsize,
          Manufacture: selectedProduct.Manufacture,
          country: selectedProduct.country,
          usdRate:"0",
          mfdate:selectedProduct.mfdate,
        };
        this.dataSource = [...this.dataSource, newRow];
        this.inputValue = ''; // Clear the input after adding
      }
      else {
        this.notification.create('error', 'Error', "Product is unavailable")
      }
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
  playSoundEffect() {
    const audio = new Audio('assets/sounds/error.mp3'); // put a nice sound in assets/sounds/error.mp3
    audio.play();
  }

  showFancyErrorToast(msg: string) {
    this.playSoundEffect();
    this.message.create('error', msg, { nzDuration: 4000 });
  }

 async submitForm() {
  if (this.params !== 'Stock Verification' && this.params !== 'Purchase Return' && this.params !== 'Stock Transfer') {
    for (const row of this.dataSource) {
      const product = this.productData.find(p => p.id === row.productId && p.batchNo === row.batchNo);
      const cleanDate = this.getDateOnlyFromString(row.expiryDate);
      const isValid = this.checkIfDateHasEnoughDaysLeft(cleanDate, row.ExpnotifDays);

      if (!isValid) {
        const dialogRef = this.dialog.open(DialogboxComponent, {
          data: {
            message: 'The expiry date has been reached. Send approvals or cancel?'
          }
        });

        const result = await lastValueFrom(dialogRef.afterClosed());

        if (result) {
          //User approved — run proceedWithSubmit() and EXIT completely
          this.proceedWithSubmit();
          return;
        } else {
          //  User cancelled — just exit
          console.log('User cancelled.');
          return;
        }
      }
    }

    // If all rows passed the expiry check
    this.isconform = true;
    this.submit();
  } else {
    //  If the form type doesn't require expiry checking
    this.isconform = true;
    this.submit();
  }
}
  async proceedWithSubmit() {
    try {
      this.isconform = false
      if (this.voucherForm.invalid) {
        Object.values(this.voucherForm.controls).forEach(control => {
          if (control.invalid) {
            control.markAsDirty();
            control.updateValueAndValidity({ onlySelf: true });
          }
        });
        return;
      }

      const todayPlus10 = new Date();
      todayPlus10.setDate(todayPlus10.getDate() + 10);

      for (const row of this.dataSource) {
        const product = this.productData.find(p => p.id === row.productId);

        if (product && row.quantity === 0) {
          this.showFancyErrorToast(`❗ The quantity for ${row.productName} must be above 0`);
          return;
        }

        if (this.voucherType === 'STOCK-TRANSFER') {
          if (product && row.quantity > product.quantity) {
            this.showFancyErrorToast(`⚠️ Quantity for ${row.productName} exceeds stock. Max available: ${product.quantity}`);
            return;
          }
        }

        if (product && row.cost === 0) {
          this.showFancyErrorToast(`💰 The cost for ${row.productName} must be above 0`);
          return;
        }



        if (product && (!row.batchNo || row.batchNo.trim() === '')) {
          this.showFancyErrorToast(`📦 The batch number for ${row.productName} is required.`);
          return;
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
      for (const row of this.dataSource) {
        this.currencyservice.get(row.cost, 'LKR').subscribe({
          next: (res) => {
            this.usdAmount = res.amountInUSD;
          },
          error: () => {
            this.usdAmount = 'Error fetching conversion';
          },
        });
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
          status: 'PENDING',
          stockStatus: this.isconform,
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
      else if (this.params !== 'Stock Verification') {
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
      else if (this.params === 'Stock Transfer') {
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
      else {
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
  async submit() {
    try {
      if (this.voucherForm.invalid) {
        Object.values(this.voucherForm.controls).forEach(control => {
          if (control.invalid) {
            control.markAsDirty();
            control.updateValueAndValidity({ onlySelf: true });
          }
        });
        return;
      }

      const todayPlus10 = new Date();
      todayPlus10.setDate(todayPlus10.getDate() + 10);

      for (const row of this.dataSource) {
        const product = this.productData.find(p => p.id === row.productId);

        if (product && row.quantity === 0) {
          this.showFancyErrorToast(`❗ The quantity for ${row.productName} must be above 0`);
          return;
        }

        if (this.voucherType === 'STOCK-TRANSFER') {
          if (product && row.quantity > product.quantity) {
            this.showFancyErrorToast(`⚠️ Quantity for ${row.productName} exceeds stock. Max available: ${product.quantity}`);
            return;
          }
        }

        if (product && row.cost === 0) {
          this.showFancyErrorToast(`💰 The cost for ${row.productName} must be above 0`);
          return;
        }


        if (row.expiryDate) {
          const expiryDate = new Date(row.expiryDate);
          const todayPlus10 = new Date();
          todayPlus10.setDate(todayPlus10.getDate() + 10);

          if (expiryDate < todayPlus10) {
            this.showFancyErrorToast(`⏳ Expiry date for ${row.productName} (${expiryDate.toLocaleDateString()}) must be at least 10 days ahead`);
            return;
          }
        }
        if (product && (!row.batchNo || row.batchNo.trim() === '')) {
          this.showFancyErrorToast(`📦 The batch number for ${row.productName} is required.`);
          return;
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
      for (const row of this.dataSource) {
        this.currencyservice.get(row.cost, 'LKR').subscribe({
          next: (res) => {
            this.usdAmount = res.amountInUSD;
          },
          error: () => {
            this.usdAmount = 'Error fetching conversion';
          },
        });
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
      else if (this.params !== 'Stock Verification') {
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
      else if (this.params === 'Stock Verification') {
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
      else {
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
