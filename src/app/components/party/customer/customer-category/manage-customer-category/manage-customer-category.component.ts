import { Component, inject } from '@angular/core';
import { MaterialModule } from '../../../../../modules/material/material.module';
import { APIResponse, IPartyCategory } from '../../../../../shared/interface';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NzModalRef, NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Observable } from 'rxjs';
import { PartyService } from '../../../../../services/party/party.service';

@Component({
  selector: 'app-manage-customer-category',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './manage-customer-category.component.html',
  styleUrl: './manage-customer-category.component.scss'
})
export class ManageCustomerCategoryComponent {
  readonly #modal = inject(NzModalRef);
  readonly nzModalData: any = inject(NZ_MODAL_DATA);
  notification = inject(NzNotificationService);
  partyservice = inject(PartyService)
  partyService = inject(PartyService)

  action = this.nzModalData?.action;

  isSpinning = false;
  responseMessage: any;

  partyCategory: FormGroup = new FormGroup({
    category: new FormControl('', [Validators.required]),
  })

  ngOnInit(): void {
    if (this.nzModalData?.data) {
      this.partyCategory.patchValue(this.nzModalData.data);
    }
  }

  submit() {
    if (this.partyCategory.invalid) {
      Object.values(this.partyCategory.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      })
      return;
    }
    this.isSpinning = true;
    var formdata = this.partyCategory.value;

    this.action === "Create" ? this.handleSubmit(this.partyservice.createPartyCategory(formdata))
      : this.handleSubmit(this.partyservice.updatePartyCategory(this.nzModalData?.data?.id, formdata));
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
