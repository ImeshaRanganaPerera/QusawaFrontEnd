import { Component, inject } from '@angular/core';
import { MaterialModule } from '../../../../modules/material/material.module';
import { BrandService } from '../../../../services/brand/brand.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NzModalRef, NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Observable } from 'rxjs';
import { APIResponse } from '../../../../shared/interface';

@Component({
  selector: 'app-manage-brand',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './manage-brand.component.html',
  styleUrl: './manage-brand.component.scss'
})
export class ManageBrandComponent {

  readonly #modal = inject(NzModalRef);
  readonly nzModalData: any = inject(NZ_MODAL_DATA);
  notification = inject(NzNotificationService)
  brandservice = inject(BrandService)

  isSpinning = false;
  action = this.nzModalData?.action;
  responseMessage: any;

  brandForm: FormGroup = new FormGroup({
    brandName: new FormControl('', [Validators.required]),
  })

  ngOnInit(): void {
    if (this.nzModalData?.data) {
      this.brandForm.patchValue(this.nzModalData.data);
    }
  }

  submit() {
    if (this.brandForm.invalid) {
      Object.values(this.brandForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      })
      return;
    }

    this.isSpinning = true;

    this.action === "Create" ? this.handleSubmit(this.brandservice.create(this.brandForm.value))
      : this.handleSubmit(this.brandservice.update(this.nzModalData?.data?.id, this.brandForm.value));
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
    this.#modal.destroy({ data: 'Modal Closed' });
  }
}
