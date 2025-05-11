import { Component, inject, Input, OnInit } from '@angular/core';
import { MaterialModule } from '../../../../modules/material/material.module';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { APIResponse } from '../../../../shared/interface';
import { Observable } from 'rxjs/internal/Observable';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ChartofAccService } from '../../../../services/chartofAcc/chartof-acc.service';
import { ChequebookService } from '../../../../services/chequebook/chequebook.service';
// import { ManagepettycashComponent } from '../../../../services/product/product.service';

@Component({
  selector: 'app-manage-cheque',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './manage-cheque.component.html',
  styleUrl: './manage-cheque.component.scss'
})
export class ManageChequeComponent implements OnInit {
  readonly #modal = inject(NzModalRef);
  readonly nzModalData: any = inject(NZ_MODAL_DATA);
  notification = inject(NzNotificationService);
  chartofaccservice = inject(ChartofAccService)
  chequebookservice = inject(ChequebookService)

  action = this.nzModalData?.action;

  isSpinning = false;
  responseMessage: any;
  banklist: any[] = [];

  chequebookForm: FormGroup = new FormGroup({
    chequeBookNumber: new FormControl('', [Validators.required]),
    totalCheques: new FormControl(''),
    startNumber: new FormControl(''),
    endNumber: new FormControl({ value: '', disabled: true }),
    remainingCheques: new FormControl(''),
    chartofAccountId: new FormControl(''),
  })

  ngOnInit(): void {
    this.getbank()
    if (this.nzModalData?.data) {
      this.chequebookForm.patchValue(this.nzModalData.data);
    }

    this.setupEndNumberCalculation();
  }

  getbank() {
    this.chartofaccservice.getChartofaccbyGrp('Bank').subscribe((res: APIResponse) => {
      this.banklist = res.data;
    })
  }

  setupEndNumberCalculation() {
    this.chequebookForm.get('startNumber')?.valueChanges.subscribe(() => {
      this.updateEndNumber();
    });

    this.chequebookForm.get('totalCheques')?.valueChanges.subscribe(() => {
      this.updateEndNumber();
    });
  }

  lastNumber: number = 0;
  updateEndNumber() {
    const startNumber = this.chequebookForm.get('startNumber')?.value;
    const totalCheques = this.chequebookForm.get('totalCheques')?.value;

    if (startNumber && totalCheques) {
      const endNumber = +startNumber + +totalCheques - 1;
      this.lastNumber = endNumber
      this.chequebookForm.get('endNumber')?.setValue(endNumber);
    }
  }

  submit() {
    if (this.chequebookForm.invalid) {
      Object.values(this.chequebookForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      })
      return;
    }

    var formdata = this.chequebookForm.value;
    var data = {
      chequeBookNumber: formdata.chequeBookNumber,
      totalCheques: parseInt(formdata.totalCheques),
      startNumber: formdata.startNumber,
      endNumber: String(this.lastNumber),
      remainingCheques: parseInt(formdata.totalCheques),
      chartofAccountId: formdata.chartofAccountId,
    }

    console.log(data)

    this.isSpinning = true;
    this.action === "Create" ? this.handleSubmit(this.chequebookservice.create(data))
      : this.handleSubmit(this.chequebookservice.update(this.nzModalData?.data?.id, data));
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
    this.#modal.destroy({ message: 'Modal Closed' });
  }

}
