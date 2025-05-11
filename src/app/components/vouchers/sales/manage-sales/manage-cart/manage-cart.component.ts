import { Component, inject } from '@angular/core';
import { MaterialModule } from '../../../../../modules/material/material.module';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NzModalRef, NZ_MODAL_DATA } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-manage-cart',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './manage-cart.component.html',
  styleUrl: './manage-cart.component.scss'
})
export class ManageCartComponent {
  isSpinning = false;

  readonly #modal = inject(NzModalRef);
  readonly nzModalData: any = inject(NZ_MODAL_DATA);

  action = this.nzModalData?.action;

  productName: string = '';

  cartForm: FormGroup = new FormGroup({
    quantity: new FormControl(1, [Validators.required]),
    MRP: new FormControl(''),
    discount: new FormControl(''),
    printName: new FormControl('')
  })

  ngOnInit(): void {
    if (this.nzModalData?.data) {
      this.cartForm.patchValue(this.nzModalData.data);
      this.productName = this.nzModalData.data.printName
    }
  }

  submit() {
    if (this.cartForm.invalid) {
      Object.values(this.cartForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      })
      return;
    }
    this.isSpinning = true;

    var formValue = this.cartForm.value

    var data = {
      id: this.nzModalData.data.id,
      printName: this.productName,
      quantity: formValue.quantity,
      maxquantity: this.nzModalData.data.maxquantity,
      MRP: formValue.MRP,
      discount: formValue.discount
    }

    this.#modal.destroy({ message: "Product add to invoice", data: data });
    
    // this.action === "Add" ? this.handleSubmit(this.productservice.create(this.productForm.value))
    //   : this.handleSubmit(this.productservice.update(this.nzModalData?.data?.id, this.productForm.value));
  }

  // handleSubmit(observable$: Observable<APIResponse>) {
  //   observable$.subscribe((res: APIResponse) => {
  //     this.responseMessage = res.message;
  //     this.isSpinning = false;
  //     this.#modal.destroy({ message: this.responseMessage, data: res.data });
  //   }, (error) => {
  //     this.responseMessage = error.error?.message || 'Something went Wrong!'
  //     this.isSpinning = false;
  //     this.notification.create('error', 'Error', this.responseMessage)
  //   })
  // }

  destroyModal(): void {
    this.#modal.destroy({ message: 'Modal Closed' });
  }
}
