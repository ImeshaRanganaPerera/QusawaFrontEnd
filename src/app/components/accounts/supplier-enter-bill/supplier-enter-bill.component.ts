import { Component, inject } from '@angular/core';
import { MaterialModule } from '../../../modules/material/material.module';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { VoucherService } from '../../../services/voucher/voucher.service';
import { APIResponse, IVoucher } from '../../../shared/interface';
import { PartyService } from '../../../services/party/party.service';
import { differenceInCalendarDays } from 'date-fns';
import { VoucherProductService } from '../../../services/voucherProduct/voucher-product.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-supplier-enter-bill',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './supplier-enter-bill.component.html',
  styleUrl: './supplier-enter-bill.component.scss'
})
export class SupplierEnterBillComponent {
  isSpinning = false;
  today = new Date();
  title: String = '';

  disabledDate = (current: Date): boolean =>
    // Can not select days before today and today
    differenceInCalendarDays(current, this.today) > 0;

  voucherservice = inject(VoucherService)
  partyservice = inject(PartyService)
  voucherProductService = inject(VoucherProductService)
  notification = inject(NzNotificationService)

  partyData: any[] = [];
  voucherProduct: any[] = [];
  voucherData: IVoucher[] = [];

  supplerEnterForm: FormGroup = new FormGroup({
    date: new FormControl('', [Validators.required]),
    voucherNumber: new FormControl({ value: '', disabled: true }),
    grnNumber: new FormControl('', [Validators.required]),
    partyId: new FormControl('', [Validators.required]),
    amount: new FormControl(''),
    grnValue: new FormControl(''),
    location: new FormControl('')
  })


  ngOnInit(): void {
    this.getVoucherNumber();
    this.getParty("SUPPLIER")

    this.supplerEnterForm.get('partyId')?.valueChanges.subscribe(partyId => {
      if (partyId) {
        this.isSpinning = true
        this.getVouchers(partyId)
      }
    })
  }

  getParty(partyname: any) {
    this.isSpinning = true;
    this.partyservice.getbygroup(partyname, true).subscribe((res: APIResponse) => {
      this.partyData = res.data;
      this.isSpinning = false;
    }, (error) => {
      this.notification.create('error', 'Error', error.error?.message || 'Something went wrong!')
    })
  }

  getVouchers(partyId: any) {
    this.voucherservice.getbypartycondition(partyId, { condition: false }).subscribe((res: APIResponse) => {
      this.voucherData = res.data;

      // Initialize dynamic form controls for each voucher
      this.voucherData.forEach(voucher => {
        this.supplerEnterForm.addControl('grnValue' + voucher.id, new FormControl('', Validators.required));
      });

      this.isSpinning = false;
    });
  }


  updateConform(data: any) {
    // Get the updated grnValue from the form control
    const grnValue = this.supplerEnterForm.get('grnValue' + data.id)?.value;
    const formData = this.supplerEnterForm.value

    if (Number(grnValue) === 0) {
      this.notification.create(
        'error',
        'Value Error',
        `The Value Amount for ${data.voucherNumber} has to be Above 0`
      );
      return; // Stop submission
    }

    if (data.amount < Number(grnValue)) {
      this.notification.create(
        'error',
        'Value Error',
        `The Entered Amount for ${data.voucherNumber} has to be Below ${data.amount}`
      );
      return; // Stop submission
    }

    const datas = {
      ...data,
      isconform: true,
      value: grnValue,
      journalEntries: [
        {
          accountId: 'IMPORT',
          debit: grnValue ? grnValue : 0,
          credit: 0,
        },
        {
          accountId: formData.partyId,
          debit: 0,
          credit: grnValue ? grnValue : 0,
        }
      ],
    }

    console.log(datas);

    this.voucherservice.updateConform(data.id, datas).subscribe((res: APIResponse) => {
      this.notification.create('success', 'Success', res.message);
      this.voucherData = this.voucherData.filter(voucher => voucher.id !== data.id);
    });
  }

  onExpandRow(data: any): void {
    if (data.expand) {
      this.voucherProductService.getbyGrp(data.id).subscribe((res: APIResponse) => {
        this.voucherProduct = res.data;
        console.log(this.voucherProduct)
      })
    }
  }

  getVoucherNumber() {
    this.voucherservice.getVoucherNumber('SUPPLIER-BILL').subscribe((res: APIResponse) => {
      this.supplerEnterForm.get('voucherNumber')?.setValue(res.data)
      this.isSpinning = false;
    })
  }
}
