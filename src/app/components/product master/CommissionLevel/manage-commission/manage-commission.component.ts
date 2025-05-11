import { Component, inject } from '@angular/core';
import { MaterialModule } from '../../../../modules/material/material.module';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NzModalRef, NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Observable } from 'rxjs';
import { DiscountLevelService } from '../../../../services/discountLevel/discount-level.service';
import { APIResponse } from '../../../../shared/interface';
import { CommissionlevelService } from '../../../../services/commissionLevel/commissionlevel.service';

@Component({
  selector: 'app-manage-commission',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './manage-commission.component.html',
  styleUrl: './manage-commission.component.scss'
})
export class ManageCommissionComponent {

  readonly #modal = inject(NzModalRef);
  readonly nzModalData: any = inject(NZ_MODAL_DATA);
  notification = inject(NzNotificationService)
  commissionLevel = inject(CommissionlevelService)

  isSpinning = false;
  action = this.nzModalData?.action;
  responseMessage: any;

  commissionForm: FormGroup = new FormGroup({
    commissionlevel: new FormControl('', [Validators.required]),
    days: new FormControl('', [Validators.required]),
    commissionRate: new FormControl('', [Validators.required]),
  })

  ngOnInit(): void {
    if (this.nzModalData?.data) {
      this.commissionForm.patchValue(this.nzModalData.data);
    }
  }

  submit() {
    if (this.commissionForm.invalid) {
      Object.values(this.commissionForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      })
      return;
    }

    this.isSpinning = true;

    this.action === "Create" ? this.handleSubmit(this.commissionLevel.create(this.commissionForm.value))
      : this.handleSubmit(this.commissionLevel.update(this.nzModalData?.data?.id, this.commissionForm.value));
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


