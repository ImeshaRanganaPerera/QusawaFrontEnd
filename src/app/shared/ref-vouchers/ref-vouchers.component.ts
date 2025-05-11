import { Component, inject } from '@angular/core';
import { MaterialModule } from '../../modules/material/material.module';
import { FormGroup, FormControl } from '@angular/forms';
import { NzModalRef, NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { IParty, APIResponse } from '../interface';

@Component({
  selector: 'app-ref-vouchers',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './ref-vouchers.component.html',
  styleUrl: './ref-vouchers.component.scss'
})
export class RefVouchersComponent {
  readonly #modal = inject(NzModalRef);
  readonly nzModalData: any = inject(NZ_MODAL_DATA);
  notification = inject(NzNotificationService);

  dataSource = this.nzModalData?.data;

  isSpinning = false;
  refVoucherForm: FormGroup = new FormGroup({
    voucherNumberid: new FormControl(''),
    
  })

  ngOnInit(): void {
    console.log(this.dataSource);
    
  }
  
  submit() {
    var invoiceAmount: any
    if (this.refVoucherForm.invalid) {
      Object.values(this.refVoucherForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      })
      return;
    }
    const selectedVoucherId = this.refVoucherForm.get('voucherNumberid')?.value;
    // Find the full voucher data by ID
    const selectedVoucher = this.dataSource.find((voucher: any) => voucher.id === selectedVoucherId);

    console.log(selectedVoucher,invoiceAmount);

    this.#modal.destroy({ data: selectedVoucher});
  }

  destroyModal(): void {
    this.#modal.destroy({ data: 'Modal Closed' });
  }
}
