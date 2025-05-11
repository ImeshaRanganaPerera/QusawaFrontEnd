import { Component, inject } from '@angular/core';
import { MaterialModule } from '../../../../modules/material/material.module';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NzModalRef, NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Observable } from 'rxjs';
import { APIResponse } from '../../../../shared/interface';
import { DiscountLevelService } from '../../../../services/discountLevel/discount-level.service';

@Component({
  selector: 'app-manage-discountlevel',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './manage-discountlevel.component.html',
  styleUrl: './manage-discountlevel.component.scss'
})
export class ManageDiscountlevelComponent {
  readonly #modal = inject(NzModalRef);
  readonly nzModalData: any = inject(NZ_MODAL_DATA);
  notification = inject(NzNotificationService)
  discountlevelService = inject(DiscountLevelService)

  isSpinning = false;
  action = this.nzModalData?.action;
  responseMessage: any;

  discountLevelForm: FormGroup = new FormGroup({
    level: new FormControl('', [Validators.required]),
    days: new FormControl('', [Validators.required]),
  })

  ngOnInit(): void {
    if (this.nzModalData?.data) {
      this.discountLevelForm.patchValue(this.nzModalData.data);
    }
  }

  submit() {
    if (this.discountLevelForm.invalid) {
      Object.values(this.discountLevelForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      })
      return;
    }

    this.isSpinning = true;

    this.action === "Create" ? this.handleSubmit(this.discountlevelService.create(this.discountLevelForm.value))
      : this.handleSubmit(this.discountlevelService.update(this.nzModalData?.data?.id, this.discountLevelForm.value));
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
