import { Component, inject, OnInit } from '@angular/core';
import { MaterialModule } from '../../../../modules/material/material.module';
import { NzModalRef, NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ProductService } from '../../../../services/product/product.service';
import { APIResponse } from '../../../../shared/interface';
import { Observable } from 'rxjs/internal/Observable';

@Component({
  selector: 'app-manage-product-price',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './manage-product-price.component.html',
  styleUrl: './manage-product-price.component.scss'
})
export class ManageProductPriceComponent implements OnInit {

  isSpinning = false;
  readonly #modal = inject(NzModalRef);
  readonly nzModalData: any = inject(NZ_MODAL_DATA);
  notification = inject(NzNotificationService);
  productService = inject(ProductService)
  responseMessage: any;

  action = this.nzModalData?.action;

  priceForm: FormGroup = new FormGroup({
    cost: new FormControl('', [Validators.required]),
    minPrice: new FormControl('', [Validators.required]),
    MRP: new FormControl('', [Validators.required]),
  })

  ngOnInit(): void {
    if (this.nzModalData?.data) {
      const formattedData = {
        ...this.nzModalData.data,
        cost: parseFloat(this.nzModalData.data.cost).toFixed(2),
        minPrice: parseFloat(this.nzModalData.data.minPrice).toFixed(2),
        MRP: parseFloat(this.nzModalData.data.MRP).toFixed(2),
      };
      this.priceForm.patchValue(formattedData);
    }
  }

  submit() {
    if (this.priceForm.invalid) {
      Object.values(this.priceForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      })
      return;
    }

    let cost = parseFloat(this.priceForm.get('cost')?.value);
    let MRP = parseFloat(this.priceForm.get('MRP')?.value);
    let minPrice = parseFloat(this.priceForm.get('minPrice')?.value);

    cost = parseFloat(cost.toFixed(2));
    MRP = parseFloat(MRP.toFixed(2));
    minPrice = parseFloat(minPrice.toFixed(2));

    console.log(cost, MRP, minPrice)

    if (isNaN(cost) || isNaN(MRP) || isNaN(minPrice)) {
      this.notification.create(
        'error',
        'Invalid Input',
        'Please ensure all values are valid numbers.'
      );
      return;
    }

    if (cost > MRP) {
      this.notification.create(
        'error',
        'Quantity Error',
        `The Cost not Above MRP`
      );
      return;
    }
    // if (cost > minPrice) {
    //   this.notification.create(
    //     'error',
    //     'Quantity Error',
    //     `The Cost not Above Min Price`
    //   );
    //   return;
    // }
    if (minPrice > MRP) {
      this.notification.create(
        'error',
        'Quantity Error',
        `The Min Price not Above MRP`
      );
      return;
    }
    var formdata = this.priceForm.value
    formdata.cost = cost;
    formdata.minPrice = minPrice;
    formdata.MRP = MRP;

    this.isSpinning = true;
    this.action === "Update" ? this.handleSubmit(this.productService.priceUpdate(this.nzModalData?.data?.id, formdata))
      : null;
  }

  handleSubmit(observable$: Observable<APIResponse>) {
    observable$.subscribe((res: APIResponse) => {
      this.responseMessage = res.message;
      console.log(res.data)
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
