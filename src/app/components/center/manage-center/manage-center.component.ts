import { Component, inject } from '@angular/core';
import { MaterialModule } from '../../../modules/material/material.module';
import { CenterService } from '../../../services/center/center.service';
import { APIResponse, ICenter } from '../../../shared/interface';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NzModalRef, NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-manage-center',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './manage-center.component.html',
  styleUrl: './manage-center.component.scss'
})
export class ManageCenterComponent {
  readonly #modal = inject(NzModalRef);
  readonly nzModalData: any = inject(NZ_MODAL_DATA);
  notification = inject(NzNotificationService);
  centerservice = inject(CenterService)

  action = this.nzModalData?.action;

  isSpinning = false;
  responseMessage: any;
  centerList: ICenter[] = [];

  centerForm: FormGroup = new FormGroup({
    centerName: new FormControl('', [Validators.required]),
    mode: new FormControl(false)
  })

  ngOnInit(): void {
    if (this.nzModalData?.data) {
      this.centerForm.patchValue({ centerName: this.nzModalData.data.centerName, mode: this.nzModalData.data.mode === 'VIRTUAL' });
    }
  }

  submit() {
    if (this.centerForm.invalid) {
      Object.values(this.centerForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    this.isSpinning = true;

    // Read form value for mode (true for VIRTUAL, false for PHYSICAL)
    const mode = this.centerForm.value.mode ? 'VIRTUAL' : 'PHYSICAL';
    const formData = {
      centerName: this.centerForm.value.centerName,
      mode: mode
    };

    // Depending on the action (Create or Update), call the corresponding method
    this.action === "Create"
      ? this.handleSubmit(this.centerservice.create(formData))
      : this.handleSubmit(this.centerservice.update(this.nzModalData?.data?.id, formData));
  }

  handleSubmit(observable$: Observable<APIResponse>) {
    observable$.subscribe((res: APIResponse) => {
      this.responseMessage = res.message;
      this.isSpinning = false;
      this.#modal.destroy({ message: this.responseMessage, data: res.data, });
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
