import { Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NzModalRef, NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { MaterialModule } from '../../../../modules/material/material.module';
import { TypeService } from '../../../../services/type/type.service';
import { APIResponse } from '../../../../shared/interface';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-manage-type',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './manage-type.component.html',
  styleUrl: './manage-type.component.scss'
})
export class ManageTypeComponent implements OnInit {

  isSpinning = false
  readonly #modal = inject(NzModalRef);
  readonly nzModalData: any = inject(NZ_MODAL_DATA);
  notification = inject(NzNotificationService)
  typeservice = inject(TypeService)

  action = this.nzModalData?.action;
  responseMessage: any;

  typeForm: FormGroup = new FormGroup({
    typeName: new FormControl('', [Validators.required]),
  })

  ngOnInit(): void {
    if (this.nzModalData?.data) {
      this.typeForm.patchValue(this.nzModalData.data);
    }
  }

  submit() {
    if (this.typeForm.invalid) {
      Object.values(this.typeForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      })
      return;
    }
    this.isSpinning = true;
    this.action === "Create" ? this.handleSubmit(this.typeservice.create(this.typeForm.value))
      : this.handleSubmit(this.typeservice.update(this.nzModalData?.data?.id, this.typeForm.value));
  }

  handleSubmit(observable$: Observable<APIResponse>) {
    observable$.subscribe((res: APIResponse) => {
      this.responseMessage = res.data;
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

