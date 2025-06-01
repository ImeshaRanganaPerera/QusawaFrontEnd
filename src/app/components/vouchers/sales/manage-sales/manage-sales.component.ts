import { Component, inject, OnInit, ViewContainerRef } from '@angular/core';
import { MaterialModule } from '../../../../modules/material/material.module';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CenterService } from '../../../../services/center/center.service';
import { InventoryService } from '../../../../services/inventory/inventory.service';
import { PartyService } from '../../../../services/party/party.service';
import { VoucherService } from '../../../../services/voucher/voucher.service';
import { IUserCenter, IParty, APIResponse, IProduct, ICenter, ITableRow } from '../../../../shared/interface';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ActivatedRoute, Router } from '@angular/router';
import { DiscountLevelService } from '../../../../services/discountLevel/discount-level.service';
import { VoucherGrpService } from '../../../../services/voucherGroup/voucher-grp.service';
import { VoucherProductService } from '../../../../services/voucherProduct/voucher-product.service';
import { PaymentModeComponent } from '../../../../shared/payment-mode/payment-mode.component';
import { RefVouchersComponent } from '../../../../shared/ref-vouchers/ref-vouchers.component';
import { PdfSelectionComponent } from '../../../../shared/pdf-selection/pdf-selection.component';
import { differenceInCalendarDays } from 'date-fns';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CurrencyService } from '../../../../services/currency/currency.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogboxComponent } from '../../../../dialogbox/dialogbox.component';
 import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-manage-sales',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './manage-sales.component.html',
  styleUrl: './manage-sales.component.scss'
})

export class ManageSalesComponent implements OnInit {
  discountLevelIddesc: any
  currentDate: Date = new Date();
  name: any = localStorage.getItem('name');
  voucherTotal!: string;
  disabledDate = (current: Date): boolean =>
    // Can not select days before today and today
    differenceInCalendarDays(current, this.currentDate) > 0;

  isSpinning = true;
  searchControl: FormControl = new FormControl('');
  filteredData: any[] = [];
  dataSource: any[] = [];
  centerData: IUserCenter[] = [];
  partyData: IParty[] = [];
  productData: any[] = [];
  filteredProducts: any[] = [];
  discountLevel: any[] = [];
  productdiscountLevel: any[] = [];
  invoiceNumber: any
  params: any
  voucherType: any
  Center: any
  refVoucherNumber: any;
  ischecked: boolean = true;
  isref: boolean = false;
  TotalAmount: number = 0;
  inputValue?: string;
  selectedBatchNo: string = '';
  expdate!: Date;
  closinexp!: Date;
  closdays: number = 0;
  fixedtotalAmount: number = 0;
  totalAmount: number = 0;
  responseMessage: any;
  dueDays: any;
  authUser: any;
  refNumberso: any;
  invoiceAmount: number = 0;
  currencyservice = inject(CurrencyService)
  route = inject(ActivatedRoute)
  notification = inject(NzNotificationService)
  dialog = inject(MatDialog)
  voucherservice = inject(VoucherService)
  centerservice = inject(CenterService)
  partyservice = inject(PartyService)
  inverntoryservice = inject(InventoryService)
  discountLevelService = inject(DiscountLevelService)
  voucherProductService = inject(VoucherProductService)
  modal = inject(NzModalService)
  viewContainerRef = inject(ViewContainerRef)
  router = inject(Router)
  role: any;

  qty: any | null = null;
  isAdmin = false;


  startEdit(id: any): void {
    this.qty = id;
  }

  stopEdit(): void {
    this.qty = null;
  }
  usdAmount: string | null = null;
  lkrAmount: string | null = null;
  selectedCustomer: IParty | null = null;
  selectedCenter: ICenter | null = null;
  formdata: {
    qty: number | null;
    batchNo: string | null;
    expiryDate: string | null;
    mfdate: string | null;
  } = {
      qty: null,
      batchNo: null,
      expiryDate: null,
      mfdate: null
    };;


  saleForm = new FormGroup({
    centerId: new FormControl('', [(Validators.required)]),
    partyId: new FormControl('', [(Validators.required)]),
    refNumber: new FormControl(''),
    date: new FormControl('', [(Validators.required)]),
    amount: new FormControl(''),
    location: new FormControl(''),
   discountLevelId: new FormControl(''),
  })

  ngOnInit(): void {
    this.saleForm.get('date')?.setValue(this.currentDate.toISOString());
    this.getRole();
    this.route.queryParams.subscribe(params => {
      this.params = params['type'];
    })
    this.userrolesidemenu()

    this.currencyservice.get(1, 'LKR').subscribe({
      next: (res) => {
        this.usdAmount = res.amountInUSD;
        this.lkrAmount = res.amountLkr;
      },
      error: () => {
        this.usdAmount = 'Error fetching conversion';
      },
    })
    if (this.params === 'Sales') {
      this.voucherType = 'INVOICE'
      this.getVoucherNumber(this.voucherType);
    }
    else if (this.params === 'Sales Return') {
      this.voucherType = 'SALES-RETURN'
      this.saleForm.get('discountLevelId')?.clearValidators();
      this.saleForm.get('discountLevelId')?.updateValueAndValidity();
      this.getVoucherNumber(this.voucherType);
    }
    else {
      this.voucherType = 'SALES-ORDER'
      this.getVoucherNumber(this.voucherType);
    }



    this.getCustomer();
    this.getCenter();
    this.getdiscountlevel();

    this.saleForm.get('discountLevelId')?.valueChanges.subscribe(discountLevelId => {
      if (discountLevelId) {
        // Call getproductDiscount with the selected discount level ID
        this.getproductDiscount(discountLevelId);
        // Update discounts for each item in dataSource
        if (this.isref = true) {

        }
        else {
          this.updateDiscountsForProducts(discountLevelId);
        }

      }
    });

    this.saleForm.get('centerId')?.valueChanges.subscribe(centerId => {
      if (centerId) {
        this.isSpinning = true;
        this.Center = centerId
        this.getProduct(centerId);
        this.fetchCenterDetails(centerId);
      }
    });

    this.saleForm.get('partyId')?.valueChanges.subscribe(partyId => {
      if (partyId) {
        this.isSpinning = true;
        this.fetchCustomerDetails(partyId);
        if (this.voucherType === 'INVOICE') {
          this.getRefVouchers('SALES-ORDER', partyId);
        }
        if (this.voucherType === 'SALES-RETURN') {
          this.getRefVouchers('INVOICE', partyId);
        }
      }
    });

    // this.saleForm.get('discountLevelId')?.valueChanges.subscribe((discountLevelId: any) => {
    //   if (discountLevelId) {
    //     const discountLevel = this.discountLevel.find((level: any) => level.id === discountLevelId);

    //     if (discountLevel) {
    //       const days = discountLevel.days; // Assuming `days` is the property where days are stored
    //       this.dueDays = days;
    //       // Now you can work with the `days` as needed
    //     } else {
    //       console.log('Discount level not found');
    //     }
    //   }
    // });
    this.saleForm.get('discountLevelId')?.valueChanges.subscribe(discountLevelId => {
      if (discountLevelId) {
        const discountLevel = this.discountLevel.find(level => level.id === discountLevelId);
        if (discountLevel) {
          this.dueDays = discountLevel.days; // Update due days if needed
        }
      }
    });

  }

  getRole() {
    this.role = localStorage.getItem('role')
  }
  selectProduct(product: any): void {
    this.inputValue = product.printName;
    this.selectedBatchNo = product.batchNo;
    this.expdate = product.expDate;
    this.closinexp = product.closingExpDate;
    this.closdays = product.ExpnotifDays;
    // Calculate the difference in days

    // Optionally, you can also store the whole object:
    // this.selectedProduct = product;
  }
  userrolesidemenu() {
    const role = localStorage.getItem('role');
    if (role) {
      this.role = role;
      this.isAdmin = role === 'ADMIN'
    } else {
      console.error('No role found in localStorage!');
    }
  }

  updateDiscountsForProducts(discountLevelId: any) {
    this.discountLevelService.getproductDiscountbyid(discountLevelId).subscribe((res: APIResponse) => {
      const discounts = res.data; // Assuming this returns an array of discount objects

      this.dataSource.forEach(row => {
        const productDiscount = discounts.find(discount => discount.productId === row.productId);
        const discountRate = productDiscount ? productDiscount.discountRate : 0;

        // Update the discount for the row
        row.discount = discountRate;

        // Recalculate the amount based on the new discount
        this.updateAmount(row);
      });

      this.calculateTotalAmount(); // Recalculate total amount after updating discounts
    });
  }

  getdiscountlevel() {
    this.discountLevelService.get().subscribe((res: APIResponse) => {
      this.discountLevel = res.data;
      console.log(this.discountLevel)
    })
  }

  getproductDiscount(id: any) {
    this.discountLevelService.getproductDiscountbyid(id).subscribe((res: APIResponse) => {
      this.productdiscountLevel = res.data;
      console.log(this.productdiscountLevel)
    })
  }

  // Fetch customer details based on selected ID
  fetchCustomerDetails(partyId: string): void {
    const selected = this.partyData.find(p => p.id === partyId);
    if (selected) {
      this.selectedCustomer = selected;
    }
    this.isSpinning = false;
  }

  // Fetch center details based on selected ID
  fetchCenterDetails(centerId: string): void {
    const selected = this.centerData.find(c => c.center?.id === centerId);
    this.selectedCenter = selected?.center ?? null;
    this.isSpinning = false;
  }

  onBack() {
    this.router.navigateByUrl('/dashboard');
  }

  getVoucherNumber(name: any) {
    this.isSpinning = true;
    this.voucherservice.getVoucherNumber(name).subscribe((res: APIResponse) => {
      this.invoiceNumber = res.data
      this.isSpinning = false;
    })
  }

  getCustomer() {
    this.partyservice.getbygroup('CUSTOMER', true).subscribe((res: APIResponse) => {
      this.partyData = res.data;
      this.isSpinning = false;
    }, (error) => {
      // this.notification.create('error', 'Error', error.error?.message || 'Something went wrong!')
    })
  }

  getRefVouchers(vouchergrp: any, partyId: any) {
    this.voucherservice.getRefVoucherbyVoucherGrp(vouchergrp, partyId).subscribe((res: APIResponse) => {
      if (res.data.length > 0) {
        this.refVoucher(res.data)
      }
      this.isSpinning = false;
    })
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
        this.isref = true,
          this.dataSource = result.data.voucherProduct.map((product: any) => ({
            ...product,
            printName: product.product?.printName,
            expiryDate: product.expDate,
            mfdate:product.mfdate
          }))
        // this.saleForm.get('discountLevelId')?.reset
        this.authUser = result.data.authUser;
        this.discountLevelIddesc = result.data.DiscountLevel
        this.refVoucherNumber = result.data.voucherNumber;
        this.refNumberso = result.data.voucherNumber;
        console.log(this.discountLevelIddesc)
        this.saleForm.get('discountLevelId')?.setValue(result.data.discountId)
        this.calculateTotalAmount();
      }
      else {
        this.notification.create('info', 'Info', 'No changes were made.')
      }
    });
  }

  clickSwitch() {
    this.ischecked = !this.ischecked;
  }

  getCenter() {
    this.centerservice.getCenterbyUser().subscribe((res: APIResponse) => {
      this.centerData = res.data;
      this.isSpinning = false;
    })
  }

  getProduct(centerId: string) {
    this.inverntoryservice.getbyCenterId(centerId).subscribe((res: any) => {
      this.productData = res.data.map((product: any) => ({
        ...product.product,
        ...product,
        expdate: product.expDate,
        mfdate:product.mfdate
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
      product.batchNo.toString().includes(value.toLowerCase())
    );
  }

  onAdd() {
    // Check if input value and quantity are provided
    if (!this.inputValue || !this.formdata.qty) {
      this.notification.create('error', 'Error', "Please enter a valid product and quantity");
      return;
    }

    // Find the selected product based on the input value
    const selectedProduct = this.productData.find(
      product => product.printName === this.inputValue
    );

    if (selectedProduct) {
      const epcDate = selectedProduct.EpcDate;
      console.log(epcDate);
    }


    if (selectedProduct) {
      // Find the discount applicable to the selected product
      const productDiscount = this.productdiscountLevel.find(
        discount => discount.productId === selectedProduct.id
      );

      this.getproductlist(selectedProduct.id, this.Center, selectedProduct.batchNo);

      // Get the discount rate, defaulting to "0" if not found
      const discountRateString = productDiscount ? productDiscount.discountRate : "0"; // Default to "0%"
      let discountValue = 0;
      const totalAmount = Number(this.formdata.qty) * selectedProduct.MRP; // Total cost before discount

      if (typeof discountRateString === 'string' && discountRateString.includes('%')) {
        // If discount is in percentage format (e.g., '50%')
        const discountRate = parseFloat(discountRateString.replace('%', '').trim()) || 0;
        discountValue = (discountRate / 100) * selectedProduct.MRP * Number(this.formdata.qty);
      } else {
        // If discount is a fixed value
        const fixedDiscount = parseFloat(discountRateString) || 0;
        discountValue = fixedDiscount * Number(this.formdata.qty); // Apply fixed discount to each quantity
      }

      // Calculate the amount after applying the discount
      const amount = totalAmount - discountValue; // Ensure the discount is subtracted from the total amount

      // Create a new row for the data source
      const newRow: ITableRow = {
        printName: selectedProduct.printName,
        productName: selectedProduct.printName,
        productId: selectedProduct.id,
        cost: selectedProduct.cost,
        currentStock: selectedProduct.quantity,
        discount: discountRateString, // Store the discount rate as it comes (e.g., "50%" or "100")
        quantity: Number(this.formdata.qty),
        sellingPrice: selectedProduct.sellingPrice || 0,
        minPrice: selectedProduct.minPrice,
        MRP: selectedProduct.MRP,
        amount: amount > 0 ? amount : 0, // Ensure amount is not negative
        batchNo: this.selectedBatchNo,
        expiryDate: this.expdate,
        ExpnotifDays: selectedProduct.ExpnotifDays,
        Packsize: selectedProduct.Packsize,
        Manufacture: selectedProduct.Manufacture,
        country: selectedProduct.country,
        usdRate:this.lkrAmount,
        mfdate:selectedProduct.mfdate,
      };

      // Update the data source with the new row
      this.dataSource = [...this.dataSource, newRow];

      // Reset input fields
      this.inputValue = '';
      this.formdata.qty = null;
      this.formdata.batchNo = null;

      // Recalculate the total amount after adding the new row
      this.calculateTotalAmount();
    } else {
      // Handle the case where the product is not found
      this.notification.create('error', 'Error', "Product is unavailable");
    }
  }

  voucherProduct: any[] = [];
  getproductlist(productId: any, centerId: any, batchNo: any) {
    this.voucherProductService.getFilteredVouchers(productId, centerId, batchNo).subscribe((res: APIResponse) => {
      this.voucherProduct = res.data
      this.isSpinning = false;
      console.log(this.voucherProduct)
    })
  }
  // Calculate amount automatically whenever cost or qty changes
  onFieldChange(row: any, field: string, value: any) {

    // If the cost or quantity changes, update the amount
    if (field === 'MRP' || field === 'quantity') {
      this.updateAmount(row);
    }

    // If the discount changes, adjust the amount
    if (field === 'discount') {
      this.applyDiscount(row);
    } ``
  }

  getProductMaxQuantity(productId: string, batchNo: string): number {
    const product = this.productData.find(p => p.id === productId && p.batchNo === batchNo);
    return product ? product.quantity : 0;
  }

  // Calculate amount based on cost and quantity
  updateAmount(row: ITableRow) {
    row.amount = row.MRP * row.quantity;
    this.applyDiscount(row); // Apply discount after calculating the base amount
    this.calculateTotalAmount();
  }

  // Apply discount based on input (either fixed or percentage)
  applyDiscount(row: any) {
    let discount = row.discount;
    let amount = row.MRP * row.quantity; // Base amount before discount

    if (typeof discount === 'string' && discount.includes('%')) {
      // If the discount is a percentage (e.g., '50%')
      const percentage = parseFloat(discount.replace('%', ''));
      row.amount = amount - (amount * (percentage / 100));
    } else {
      // If the discount is a fixed amount (e.g., '50')
      const fixedDiscount = parseFloat(discount) || 0;
      row.amount = (row.MRP - fixedDiscount) * row.quantity; // Apply discount first, then multiply by quantity
      row.amount = Math.max(0, row.amount); // Ensure the final amount does not go negative
    }

    this.calculateTotalAmount(); // Recalculate the total for all rows
  }
  totalCost: any = 0;

  calculateTotalAmount() {
    this.totalAmount = this.dataSource.reduce((sum, row) => sum + Number(row.amount), 0);
    this.totalCost = this.dataSource.reduce((sum, row) => sum + Number(row.cost * row.quantity), 0);
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



async submitForm() {
  for (const row of this.dataSource) {
    const product = this.productData.find(p => p.id === row.productId && p.batchNo === row.batchNo);
    const cleanDate = this.getDateOnlyFromString(product.expDate);
    const isValid = this.checkIfDateHasEnoughDaysLeft(cleanDate, product.ExpnotifDays);

    if (!isValid) {
      const dialogRef = this.dialog.open(DialogboxComponent, {
        data: {
          message: 'The expiry date has been reached. Send approvals or cancel?'
        }
      });

      const result = await lastValueFrom(dialogRef.afterClosed());

      if (result) {
        this.proceedWithSubmit();
      } else {
        console.log('User cancelled.');
      }
      return; // Exit either way
    }
  }

  // If we reach here, all expiry dates were valid

  if (this.voucherType === 'INVOICE') {
    if (this.saleForm.invalid) {
      Object.values(this.saleForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    for (const row of this.dataSource) {
      const product = this.productData.find(p => p.id === row.productId && p.batchNo === row.batchNo);

      if (this.voucherType !== 'SALES-ORDER') {
        if (product && Number(row.quantity) > Number(product.quantity)) {
          this.notification.create('error', 'Quantity Error', `The quantity for ${row.printName} exceeds available stock. Maximum available: ${product.quantity}.`);
          return;
        }
      }

      if (product && Number(row.quantity) === 0) {
        this.notification.create('error', 'Quantity Error', `The quantity for ${row.printName} has to be above 0`);
        return;
      }

      if (product && Number(row.MRP) < Number(product.minPrice)) {
        this.notification.create('error', 'Min Price Error', `The Min Price for ${row.printName} has to be above ${product.minPrice}`);
        return;
      }
    }

    if (this.totalAmount <= 0) {
      this.notification.create('error', 'Error', 'Paid amount should not be 0');
      return;
    }

    // Submit for INVOICE
    this.paymentMode('ALL', this.totalAmount, 'DEBIT');

  } else {
    // All other voucher types (e.g., SALES-RETURN)
    if (this.saleForm.invalid) {
      Object.values(this.saleForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    if (this.totalAmount <= 0) {
      this.notification.create('error', 'Error', 'Paid amount should not be 0');
      return;
    }

    this.paymentMode('ALL', this.totalAmount, 'CREDIT');
  }
}


  async proceedWithSubmit() {
    this.ischecked = false
    if (this.saleForm.invalid) {
      Object.values(this.saleForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      })
      return;
    }
    for (const row of this.dataSource) {
      const product = this.productData.find(p => p.id === row.productId && p.batchNo === row.batchNo);
      if (this.voucherType !== 'SALES-ORDER') {
        if (product && Number(row.quantity) > Number(product.quantity)) {
          this.notification.create(
            'error',
            'Quantity Error',
            `The quantity for ${row.printName} exceeds available stock. Maximum available: ${product.quantity}.`
          );
          return; // Stop submission
        }
      }

      if (product && Number(product.quantity) === 0) {
        this.notification.create(
          'error',
          'Quantity Error',
          `The quantity for ${row.printName} has to be above 0`
        );
        return; // Stop submission
      }
      if (product && Number(row.MRP) < Number(product.minPrice)) {
        this.notification.create(
          'error',
          'Min Price Error',
          `The Min Price for ${row.printName} has to be above ${product.minPrice}`
        );
        return; // Stop submission
      }
    }

    if (this.totalAmount <= 0) {
      this.notification.create('error', 'Error', 'Paid amount should not be 0');
      return;
    }

    const coords = await this.getCurrentLocation();
    const location = `Latitude: ${coords.latitude}, Longitude: ${coords.longitude}`;

    // Add location to form data or process as needed
    this.saleForm.get('location')?.setValue(location);
    var formData = this.saleForm.value;

    if (!(this.dataSource && this.dataSource.length > 0)) {
      this.notification.create('error', 'Error', 'Product list is empty');
      this.isSpinning = false;
      return;
    }

    var data;

    data = {
      date: formData.date,
      voucherNumber: this.invoiceNumber,
      refNumber: formData.refNumber,
      centerId: formData.centerId,
      partyId: formData.partyId,
      amount: this.totalAmount,
      authUser: this.authUser ? this.authUser : null,
      location: formData.location,
      isconform: this.ischecked,
      isPayment: this.ischecked,
      stockStatus: this.ischecked,
      status: 'PENDING',
      refVoucherNumber: this.refVoucherNumber || null,
      discountLevel: this.saleForm.get('discountLevelId')?.value,
      isRef: false,
      dueDays: this.dueDays,
      voucherGroupname: this.voucherType,
      discountLevelIddesc: this.saleForm.get('discountLevelId')?.value,
      productList: this.dataSource,
    }

    console.log(data)

    this.voucherservice.create(data).subscribe((res: APIResponse) => {
      this.responseMessage = res.message
      this.resetForm()
      this.isSpinning = false;
      this.ischecked = true;
      this.notification.create('success', 'Success', this.responseMessage);
    }, (error) => {
      this.responseMessage = error.error?.message || 'Something went wrong!'
      this.isSpinning = false;
      this.notification.create('error', 'Error', this.responseMessage);
    })
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


  async checkout() {
    this.submitForm()

    if (this.ischecked === true) {
      if (this.voucherType === 'INVOICE') {
        if (this.saleForm.invalid) {
          Object.values(this.saleForm.controls).forEach(control => {
            if (control.invalid) {
              control.markAsDirty();
              control.updateValueAndValidity({ onlySelf: true });
            }
          })
          return;
        }
        for (const row of this.dataSource) {
          const product = this.productData.find(p => p.id === row.productId && p.batchNo === row.batchNo);
          if (this.voucherType !== 'SALES-ORDER') {
            if (product && Number(row.quantity) > Number(product.quantity)) {
              this.notification.create(
                'error',
                'Quantity Error',
                `The quantity for ${row.printName} exceeds available stock. Maximum available: ${product.quantity}.`
              );
              return; // Stop submission
            }
          }

          if (product && Number(row.quantity) === 0) {
            this.notification.create(
              'error',
              'Quantity Error',
              `The quantity for ${row.printName} has to be above 0`
            );
            return; // Stop submission
          }
          if (product && Number(row.MRP) < Number(product.minPrice)) {
            this.notification.create(
              'error',
              'Min Price Error',
              `The Min Price for ${row.printName} has to be above ${product.minPrice}`
            );
            return; // Stop submission
          }
        }
        if (this.totalAmount <= 0) {
          this.notification.create('error', 'Error', 'Paid amount should not be 0');
          return;
        }
        // this.submit();
        //this.paymentMode('ALL', this.totalAmount, 'DEBIT')
      }
      // else if (this.voucherType === 'SALES-RETURN') {
      //   if (this.saleForm.invalid) {
      //     Object.values(this.saleForm.controls).forEach(control => {
      //       if (control.invalid) {
      //         control.markAsDirty();
      //         control.updateValueAndValidity({ onlySelf: true });
      //       }
      //     })
      //     return;
      //   }
      //   if (this.totalAmount <= 0) {
      //     this.notification.create('error', 'Error', 'Paid amount should not be 0');
      //     return;
      //   }
      //   this.paymentMode('ALL', this.totalAmount, 'CREDIT')
      // }
      else {
        if (this.saleForm.invalid) {
          Object.values(this.saleForm.controls).forEach(control => {
            if (control.invalid) {
              control.markAsDirty();
              control.updateValueAndValidity({ onlySelf: true });
            }
          })
          return;
        }
        // this.submit();
      }
    }

    else {
      if (this.saleForm.invalid) {
        Object.values(this.saleForm.controls).forEach(control => {
          if (control.invalid) {
            control.markAsDirty();
            control.updateValueAndValidity({ onlySelf: true });
          }
        })
        return;
      }
      for (const row of this.dataSource) {
        const product = this.productData.find(p => p.id === row.productId && p.batchNo === row.batchNo);
        if (this.voucherType !== 'SALES-ORDER') {
          if (product && Number(row.quantity) > Number(product.quantity)) {
            this.notification.create(
              'error',
              'Quantity Error',
              `The quantity for ${row.printName} exceeds available stock. Maximum available: ${product.quantity}.`
            );
            return; // Stop submission
          }
        }

        if (product && Number(row.quantity) === 0) {
          this.notification.create(
            'error',
            'Quantity Error',
            `The quantity for ${row.printName} has to be above 0`
          );
          return; // Stop submission
        }
        if (product && Number(row.MRP) < Number(product.minPrice)) {
          this.notification.create(
            'error',
            'Min Price Error',
            `The Min Price for ${row.printName} has to be above ${product.minPrice}`
          );
          return; // Stop submission
        }
      }

      if (this.totalAmount <= 0) {
        this.notification.create('error', 'Error', 'Paid amount should not be 0');
        return;
      }

      const coords = await this.getCurrentLocation();
      const location = `Latitude: ${coords.latitude}, Longitude: ${coords.longitude}`;

      // Add location to form data or process as needed
      this.saleForm.get('location')?.setValue(location);
      var formData = this.saleForm.value;

      if (!(this.dataSource && this.dataSource.length > 0)) {
        this.notification.create('error', 'Error', 'Product list is empty');
        this.isSpinning = false;
        return;
      }

      // var data;

      // data = {
      //   date: formData.date,
      //   voucherNumber: this.invoiceNumber,
      //   refNumber: formData.refNumber,
      //   centerId: formData.centerId,
      //   partyId: formData.partyId,
      //   amount: this.totalAmount,
      //   authUser: this.authUser ? this.authUser : null,
      //   location: formData.location,
      //   isconform: this.ischecked,
      //   isPayment: this.ischecked,
      //   stockStatus: this.ischecked,
      //   status: 'PENDING',
      //   refVoucherNumber: this.refVoucherNumber || null,
      //   discountLevel: this.saleForm.get('discountLevelId')?.value,
      //   isRef: false,
      //   dueDays: this.dueDays,
      //   voucherGroupname: this.voucherType,
      //   discountLevelIddesc: this.saleForm.get('discountLevelId')?.value,
      //   productList: this.dataSource
      // }

      // console.log(data)

      // this.voucherservice.create(data).subscribe((res: APIResponse) => {
      //   this.responseMessage = res.message
      //   this.resetForm()
      //   this.isSpinning = false;
      //   this.notification.create('success', 'Success', this.responseMessage);
      // }, (error) => {
      //   this.responseMessage = error.error?.message || 'Something went wrong!'
      //   this.isSpinning = false;
      //   this.notification.create('error', 'Error', this.responseMessage);
      // })
    }
  }

  paymentMode(mode: string, amount: any, tranType: any) {
    const modal = this.modal.create({
      nzContent: PaymentModeComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzWidth: "700px",
      nzFooter: [],
      nzData: { amount: amount, mode: mode, tranType: tranType },
    })
    modal.afterClose.subscribe((result: any) => {
      if (result && result.data) {
        if (mode === 'ALL' && result.data) {
          this.submit(result.data)
          this.isSpinning = true;
          console.log(result.data)
        } else if (mode === 'NOCREDIT' && result.data) {
          this.submit(result.data)
        }
      }
      else {
        this.notification.create('info', 'Info', 'No changes were made.')
      }
    });
  }

  async submit(payments?: any) {
    try {
      // const coords = await this.getCurrentLocation();
      // const location = `Latitude: ${coords.latitude}, Longitude: ${coords.longitude}`;

      // // Add location to form data or process as needed
      // this.saleForm.get('location')?.setValue(location);
      var formData = this.saleForm.value;

      if (!(this.dataSource && this.dataSource.length > 0)) {
        this.notification.create('error', 'Error', 'Product list is empty');
        this.isSpinning = false;
        return;
      }

      var data;
      if (this.voucherType === 'INVOICE') {
        data = {
          date: formData.date,
          voucherNumber: this.invoiceNumber,
          refNumber: formData.refNumber,
          centerId: formData.centerId,
          partyId: formData.partyId,
          amount: this.totalAmount,
          // discountLevelIddesc: this.saleForm.get('discountLevelId')?.value,
          authUser: this.authUser ? this.authUser : null,
          location: formData.location,
          isconform: this.ischecked,
          refVoucherNumber: this.refVoucherNumber || null,
          status: this.refVoucherNumber ? 'COMPLETED' : 'COMPLETED',
          isRef: false,
          stockStatus: true,
          paidValue: Number(this.totalAmount) - Number(payments.credit),
          firstPay: Number(this.totalAmount) - Number(payments.credit),
          dueDays: this.dueDays,
          payment: payments,
          voucherGroupname: this.voucherType,
          productList: this.dataSource,
          //discountLevel : this.discountLevel
          discountLevel: this.saleForm.get('discountLevelId')?.value,
          // invoiceAmount: this.totalAmount,
        };

      }
      else if (this.voucherType === 'SALES-RETURN') {
        data = {
          date: formData.date,
          voucherNumber: this.invoiceNumber,
          refNumber: formData.refNumber,
          centerId: formData.centerId,
          partyId: formData.partyId,
          // returnValue: this.totalAmount,
          amount: this.totalAmount,
          invoiceAmount: this.totalAmount,
          returnValue: this.totalAmount,
          isconform: false,
          location: formData.location,
          refVoucherNumber: this.refVoucherNumber || null,
          // isRef: this.refVoucherNumber ? true : false,   
          isRef: false, // `true` only if `amount` equals `returnValue`
          stockStatus: false,
          paidValue: 0,
          status: 'PENDING',
          authUser: this.authUser ? this.authUser : null,
          // payment: payments,
          voucherGroupname: this.voucherType,
          productList: this.dataSource
        }
      }

      else if (this.voucherType === 'SALES-ORDER') {
        data = {
          date: this.currentDate,
          voucherNumber: this.invoiceNumber,
          refNumber: formData.refNumber,
          centerId: formData.centerId,
          partyId: formData.partyId,
          amount: this.totalAmount,
          // discountLevelIddesc: this.saleForm.get('discountLevelId')?.value,
          dueDays: this.dueDays,
          isPayment: false,
          stockStatus: false,
          location: formData.location,
          status: "PENDING",
          paidValue: 0,
          voucherGroupname: this.voucherType,
          productList: this.dataSource,
          discountLevel: this.saleForm.get('discountLevelId')?.value,
        }
      }

      if (this.voucherType === 'INVOICE') {
        const journalEntries = this.generateJournalEntries(data, payments);
        data = {
          ...data, journalEntries
        }
      }
      else if (this.voucherType === 'SALES-RETURN') {
        data = {
          ...data,
        }
      }
      console.log(data)

      this.voucherservice.create(data).subscribe((res: APIResponse) => {
        this.responseMessage = res.message
        this.resetForm()
        this.isSpinning = false;
        if (this.voucherType !== 'SALES-RETURN') {
          this.printoutSelection(res.data, this.voucherType)
        }
        this.notification.create('success', 'Success', this.responseMessage);
      }, (error) => {
        this.responseMessage = error.error?.message || 'Something went wrong!'
        this.isSpinning = false;
        this.notification.create('error', 'Error', this.responseMessage);
      })
    } catch (error) {
      console.error('Error getting location:', error);
      this.isSpinning = false;
      this.notification.create('error', 'Error', 'Failed to get current location.');
    }
  }

  generateJournalEntries(data: any, payments: any) {
    const journalEntries: any[] = [];
    const isDebit = this.params === "Sales";
    const isCredit = !isDebit; // ForSales retrun

    // Get the correct account ID to apply the opposite entry (debit or credit)
    const chartofaccId = data.chartofAccountId || this.getChartofAccIdFromParty(data.partyId);

    // Process cash payment
    if (payments.cash > 0) {
      journalEntries.push({
        accountId: "CASH", // Cash account
        debit: isCredit ? 0 : payments.cash, // Debit for Receipt
        credit: isCredit ? payments.cash : 0 // Credit for Payment or UtilityBillPayment
      });
      journalEntries.push({
        accountId: chartofaccId, // Cash account
        debit: payments.cash, // Debit for Receipt
        credit: 0 // Credit for Payment or UtilityBillPayment
      });
      journalEntries.push({
        accountId: chartofaccId, // Cash account
        debit: 0, // Debit for Receipt
        credit: payments.cash // Credit for Payment or UtilityBillPayment
      });
    }

    // Process online transfer payment
    if (payments.onlineTransfer > 0 && payments.bankAccId) {
      journalEntries.push({
        accountId: payments.bankAccId, // Bank account for online transfer
        debit: isCredit ? 0 : payments.onlineTransfer,
        credit: isCredit ? payments.onlineTransfer : 0
      });
    }

    // Process cheque payment
    if (payments.cheque > 0) {
      journalEntries.push({
        accountId: "Check", // Bank account for cheque
        debit: isCredit ? 0 : payments.cheque,
        credit: isCredit ? payments.cheque : 0
      });
    }

    // Add the opposite entry for the chartofaccId (e.g., party account)
    if (payments.credit > 0) {
      journalEntries.push({
        accountId: chartofaccId,
        debit: isCredit ? 0 : payments.credit,
        credit: isCredit ? payments.credit : 0
      });
    }

    journalEntries.push({
      accountId: 'Sales',
      debit: isCredit ? data.amount : 0,
      credit: isCredit ? 0 : data.amount
    });

    journalEntries.push({
      accountId: 'INVENTORY',
      debit: isCredit ? this.totalCost : 0,
      credit: isCredit ? 0 : this.totalCost
    });

    journalEntries.push({
      accountId: 'COST',
      debit: isCredit ? 0 : this.totalCost,
      credit: isCredit ? this.totalCost : 0
    });

    return journalEntries;
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
        // this.notification.create('info', 'Info', 'No changes were made.')
      }
    });
  }

  resetForm() {
    this.saleForm.reset();
    this.saleForm.get('date')?.setValue(this.currentDate.toISOString());
    this.isSpinning = true;
    this.selectedCustomer = null;
    this.dataSource = [];
    this.filteredData = [];
    this.productData = [];
    this.filteredProducts = [];
    this.getVoucherNumber(this.voucherType);
    this.totalAmount = 0;
    this.refVoucherNumber = '';
    this.ischecked = true;
  }

  cancel(): void {
    this.nzMessageService.info('click cancel');
  }

  constructor(private nzMessageService: NzMessageService) { }

}
