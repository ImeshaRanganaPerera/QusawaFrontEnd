import { Component, inject } from '@angular/core';
import { MaterialModule } from '../../../../../modules/material/material.module';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NzModalRef, NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Observable } from 'rxjs';
import { PartyService } from '../../../../../services/party/party.service';
import { APIResponse } from '../../../../../shared/interface';

@Component({
  selector: 'app-manage-customer-type',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './manage-customer-type.component.html',
  styleUrl: './manage-customer-type.component.scss'
})
export class ManageCustomerTypeComponent {
  readonly #modal = inject(NzModalRef);
  readonly nzModalData: any = inject(NZ_MODAL_DATA);
  notification = inject(NzNotificationService);
  partyservice = inject(PartyService)

  action = this.nzModalData?.action;

  isSpinning = false;
  responseMessage: any;

  partyType: FormGroup = new FormGroup({
    type: new FormControl('', [Validators.required]),
  })

  ngOnInit(): void {
    if (this.nzModalData?.data) {
      this.partyType.patchValue(this.nzModalData.data);
    }
  }

  submit() {
    if (this.partyType.invalid) {
      Object.values(this.partyType.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      })
      return;
    }
    this.isSpinning = true;
    var formdata = this.partyType.value;

    this.action === "Create" ? this.handleSubmit(this.partyservice.createPartyType(formdata))
      : this.handleSubmit(this.partyservice.updatePartyType(this.nzModalData?.data?.id, formdata));
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
