import { Component, inject } from '@angular/core';
import { MaterialModule } from '../../../../modules/material/material.module';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NzModalRef, NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Observable } from 'rxjs';
import { PartyService } from '../../../../services/party/party.service';
import { IParty, APIResponse } from '../../../../shared/interface';

@Component({
  selector: 'app-manage-supplier',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './manage-supplier.component.html',
  styleUrl: './manage-supplier.component.scss'
})
export class ManageSupplierComponent {
  readonly #modal = inject(NzModalRef);
  readonly nzModalData: any = inject(NZ_MODAL_DATA);
  notification = inject(NzNotificationService);
  partyservice = inject(PartyService)

  action = this.nzModalData?.action;

  isSpinning = false;
  responseMessage: any;
  partyList: IParty[] = [];

  partyForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    nic: new FormControl(''),
    phoneNumber: new FormControl('', [Validators.required, Validators.minLength(9), Validators.maxLength(10), Validators.pattern(/^[0-9]*$/)]),
    address1: new FormControl('', [Validators.required]),
    address2: new FormControl(''),
    creditValue: new FormControl(''),
    creditPeriod: new FormControl(''),
    email: new FormControl(''),
  })

  ngOnInit(): void {
    if (this.nzModalData?.data) {
      this.partyForm.patchValue(this.nzModalData.data);
    }
  }

  submit() {
    if (this.partyForm.invalid) {
      Object.values(this.partyForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      })
      return;
    }
    this.isSpinning = true;

    var formdata = this.partyForm.value;
    var data = {
      name: formdata.name,
      nic: formdata.nic,
      phoneNumber: String(formdata.phoneNumber),
      address1: formdata.address1,
      address2: formdata.address2,
      creditValue: String(formdata.creditValue),
      creditPeriod: String(formdata.creditPeriod),
      email: formdata.email,
      Opening_Balance: 0,
      partyGroup: 'SUPPLIER'
    };
    this.action === "Create" ? this.handleSubmit(this.partyservice.create(data))
      : this.handleSubmit(this.partyservice.update(this.nzModalData?.data?.id, data));
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