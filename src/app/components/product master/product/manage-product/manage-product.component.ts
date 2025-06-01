import { Component, inject, Input, OnInit } from '@angular/core';
import { MaterialModule } from '../../../../modules/material/material.module';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { APIResponse, IBrand, IDiscountLevel, IType } from '../../../../shared/interface';
import { Observable } from 'rxjs/internal/Observable';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { BrandService } from '../../../../services/brand/brand.service';
import { TypeService } from '../../../../services/type/type.service';
import { ProductService } from '../../../../services/product/product.service';
import { DiscountLevelService } from '../../../../services/discountLevel/discount-level.service';
import { CommissionlevelService } from '../../../../services/commissionLevel/commissionlevel.service';

const getBase64 = (file: File): Promise<string | ArrayBuffer | null> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

@Component({
  selector: 'app-manage-product',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './manage-product.component.html',
  styleUrl: './manage-product.component.scss'
})

export class ManageProductComponent implements OnInit {

  readonly #modal = inject(NzModalRef);
  readonly nzModalData: any = inject(NZ_MODAL_DATA);
  notification = inject(NzNotificationService);
  brandservice = inject(BrandService)
  typeservice = inject(TypeService)
  productservice = inject(ProductService)
  discountLevelservice = inject(DiscountLevelService)
  commissionLevel = inject(CommissionlevelService)
  fb = inject(FormBuilder)

  action = this.nzModalData?.action;

  isSpinning = true;
  responseMessage: any;
  brandlist: IBrand[] = [];
  typeList: IType[] = [];
  discountLevelList: IDiscountLevel[] = [];
  commissionLevelList: any[] = [];

  productForm: FormGroup = new FormGroup({
    itemCode: new FormControl('', [Validators.required]),
    barcode: new FormControl(''),
    productName: new FormControl(''),
    printName: new FormControl(''),
    image: new FormControl(''),
    criticalLevel: new FormControl(0),
    ExpnotifDays:new FormControl(0),
    typeId: new FormControl(''),
    Packsize:new FormControl('1'),
    Manufacture:new FormControl(''),
    country: new FormControl('') ,
    // brandId: new FormControl(''),
    // OEMnumber: new FormControl(''),
  })

selectedCountry: any;

  // country.component.ts (or a separate file like countries.ts you can import)
 countries: { code: string; name: string }[] = [
  { code: 'AF', name: 'Afghanistan' },
  { code: 'AL', name: 'Albania' },
  { code: 'DZ', name: 'Algeria' },
  { code: 'AD', name: 'Andorra' },
  { code: 'AO', name: 'Angola' },
  { code: 'AR', name: 'Argentina' },
  { code: 'AM', name: 'Armenia' },
  { code: 'AU', name: 'Australia' },
  { code: 'AT', name: 'Austria' },
  { code: 'AZ', name: 'Azerbaijan' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BT', name: 'Bhutan' },
  { code: 'BR', name: 'Brazil' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'CA', name: 'Canada' },
  { code: 'CL', name: 'Chile' },
  { code: 'CN', name: 'China' },
  { code: 'CO', name: 'Colombia' },
  { code: 'HR', name: 'Croatia' },
  { code: 'CY', name: 'Cyprus' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'DK', name: 'Denmark' },
  { code: 'EG', name: 'Egypt' },
  { code: 'EE', name: 'Estonia' },
  { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' },
  { code: 'GE', name: 'Georgia' },
  { code: 'DE', name: 'Germany' },
  { code: 'GR', name: 'Greece' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'HU', name: 'Hungary' },
  { code: 'IN', name: 'India' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'IR', name: 'Iran' },
  { code: 'IQ', name: 'Iraq' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IL', name: 'Israel' },
  { code: 'IT', name: 'Italy' },
  { code: 'JP', name: 'Japan' },
  { code: 'JO', name: 'Jordan' },
  { code: 'KZ', name: 'Kazakhstan' },
  { code: 'KE', name: 'Kenya' },
  { code: 'KR', name: 'South Korea' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'LV', name: 'Latvia' },
  { code: 'LB', name: 'Lebanon' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'MV', name: 'Maldives' },
  { code: 'MT', name: 'Malta' },
  { code: 'MX', name: 'Mexico' },
  { code: 'MC', name: 'Monaco' },
  { code: 'MA', name: 'Morocco' },
  { code: 'MM', name: 'Myanmar' },
  { code: 'NP', name: 'Nepal' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'NO', name: 'Norway' },
  { code: 'OM', name: 'Oman' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'PS', name: 'Palestine' },
  { code: 'PE', name: 'Peru' },
  { code: 'PH', name: 'Philippines' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'QA', name: 'Qatar' },
  { code: 'RO', name: 'Romania' },
  { code: 'RU', name: 'Russia' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'RS', name: 'Serbia' },
  { code: 'SG', name: 'Singapore' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'ES', name: 'Spain' },
  { code: 'LK', name: 'Sri Lanka' },
  { code: 'SE', name: 'Sweden' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'SY', name: 'Syria' },
  { code: 'TW', name: 'Taiwan' },
  { code: 'TH', name: 'Thailand' },
  { code: 'TR', name: 'Turkey' },
  { code: 'UA', name: 'Ukraine' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'YE', name: 'Yemen' },
  { code: 'ZM', name: 'Zambia' },
  { code: 'ZW', name: 'Zimbabwe' }
];


  ngOnInit(): void {
    this.getBrand();
    this.getType();
    this.getDiscountLevels();
    this.getCommissionLevels();

    console.log(this.countries);
    if (this.nzModalData?.data) {
      this.productForm.patchValue(this.nzModalData.data);
      console.log(this.nzModalData.data)

      if (this.nzModalData.data.OEMNumber) {
        const oemNumbers = this.nzModalData.data.OEMNumber.map((oem: any) => oem.OEMnumber).join(', ');
        this.productForm.patchValue({ OEMnumber: oemNumbers });
      }
    }

    this.productForm.get('productName')?.valueChanges.subscribe(() => {
      this.updatePrintName();
    });

    this.productForm.get('itemCode')?.valueChanges.subscribe(() => {
      this.updatePrintName();
    });
  }

  updatePrintName() {
    const productName = this.productForm.get('productName')?.value || '';
    // const brandId = this.productForm.get('brandId')?.value;
    const itemCode = this.productForm.get('itemCode')?.value;

    // Find the selected brand by its ID
    // const brandName = this.brandlist.find(brand => brand.id === brandId)?.brandName || '';

    // Concatenate the brand name with the product name
    const printName = ` ${productName}`.trim();

    // Set the print name in the form
    this.productForm.get('printName')?.setValue(printName, { emitEvent: false });
  }

  getBrand() {
    this.isSpinning = true;
    this.brandservice.get().subscribe((res: APIResponse) => {
      this.brandlist = res.data;
      this.isSpinning = false;
    }, (error) => {
      this.responseMessage = error.error?.message || 'Something went Wrong!'
      this.isSpinning = false;
      this.notification.create('error', 'Error', this.responseMessage)
    })
  }

  getType() {
    this.isSpinning = true;
    this.typeservice.get().subscribe((res: APIResponse) => {
      this.typeList = res.data;
      this.isSpinning = false;
    }, (error) => {
      this.responseMessage = error.error?.message || 'Something went Wrong!'
      this.isSpinning = false;
      this.notification.create('error', 'Error', this.responseMessage)
    })
  }

  getDiscountLevels() {
    this.isSpinning = true;
    this.discountLevelservice.get().subscribe((res: APIResponse) => {
      this.discountLevelList = res.data;

      // Dynamically add controls for discount levels
      this.discountLevelList.forEach(level => {
        this.productForm.addControl(level.id, new FormControl(0));
        if (this.nzModalData?.data?.productDiscountLevel) {
          const existingDiscount = this.nzModalData.data.productDiscountLevel.find((dis: any) => dis.discountLevelId === level.id);

          // If a match is found, patch the value to the corresponding control
          if (existingDiscount) {
            this.productForm.get(level.id)?.patchValue(existingDiscount.discountRate);
          }
        }
      });

      this.isSpinning = false;  // Ensure to stop the spinner after processing
    }, (error) => {
      this.responseMessage = error.error?.message || 'Something went Wrong!';
      this.isSpinning = false;
      this.notification.create('error', 'Error', this.responseMessage);
    });
  }

  getCommissionLevels() {
    this.isSpinning = true;
    this.commissionLevel.get().subscribe((res: APIResponse) => {
      this.commissionLevelList = res.data;

      // Dynamically add controls for discount levels
      this.commissionLevelList.forEach(com => {
        this.productForm.addControl(com.id, new FormControl(''));
        if (this.nzModalData?.data?.productcommissionRate) {
          const existingCommission = this.nzModalData.data.productcommissionRate.find((rate: any) => rate.commissionRateId === com.id);

          // If a match is found, patch the value to the corresponding control
          if (existingCommission) {
            this.productForm.get(com.id)?.patchValue(existingCommission.commissionRate);
          }
        }
      });

      this.isSpinning = false;  // Ensure to stop the spinner after processing
    }, (error) => {
      this.responseMessage = error.error?.message || 'Something went Wrong!';
      this.isSpinning = false;
      this.notification.create('error', 'Error', this.responseMessage);
    });
  }

  submit() {
    if (this.productForm.invalid) {
      Object.values(this.productForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      })
      return;
    }
 //   const oemNumbers = this.productForm.get('OEMnumber')?.value.split(',').map((num: string) => num.trim()) || [];

    // Map the array of strings into an array of objects
    // const oemNumberObjects = oemNumbers.map((num: string) => ({
    //   OEMnumber: num // Assuming `OEnumber` is the field in your Prisma schema
    // }));

    const discountLevels = this.discountLevelList.map(level => ({
      discountLevelId: level.id,
      discountRate: this.productForm.get(level.id)?.value || ''  // Fetch value from the form control
    }));

    const productcommissionRate = this.commissionLevelList.map(com => ({
      commissionRateId: com.id,
      commissionRate: this.productForm.get(com.id)?.value || ''  // Fetch value from the form control
    }));

    const updatedFormValue = {
      ...this.productForm.value,
    
      // OEMnumberList: oemNumberObjects, // Assign the list of objects
      discountLevels: discountLevels,
      commissionLevels: productcommissionRate
    };

    console.log(updatedFormValue)

    this.isSpinning = true;
    this.action === "Create" ? this.handleSubmit(this.productservice.create(updatedFormValue))
      : this.handleSubmit(this.productservice.update(this.nzModalData?.data?.id, updatedFormValue));
  }

  handleSubmit(observable$: Observable<APIResponse>) {
    observable$.subscribe((res: APIResponse) => {
      this.responseMessage = res.message;
      this.isSpinning = false;
      this.#modal.destroy({ message: this.responseMessage, data: res.data });
    }, (error) => {
      this.responseMessage = error.error?.message || 'Something went Wrong!'
      this.isSpinning = false;
      this.notification.create('error', 'Error', this.responseMessage)
    })
  }

  destroyModal(): void {
    this.#modal.destroy({ message: 'Modal Closed' });
  }

}
