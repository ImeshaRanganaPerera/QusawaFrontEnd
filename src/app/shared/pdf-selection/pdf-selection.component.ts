import { Component, inject } from '@angular/core';
import { MaterialModule } from '../../modules/material/material.module';
import { FormGroup, FormControl } from '@angular/forms';
import { NzModalRef, NZ_MODAL_DATA, NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ReceiptVoucherComponent } from '../receipt-voucher/receipt-voucher.component';
import { InvoicePdfComponent } from '../invoice-pdf/invoice-pdf.component';
import { environment } from '../../../environments/environment';
import { DownloadPdfNewComponent } from '../download-pdf-new/download-pdf-new/download-pdf-new.component';

@Component({
  selector: 'app-pdf-selection',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './pdf-selection.component.html',
  styleUrl: './pdf-selection.component.scss'
})
export class PdfSelectionComponent {

  readonly #modal = inject(NzModalRef);
  modal = inject(NzModalService)
  readonly nzModalData: any = inject(NZ_MODAL_DATA);
  notification = inject(NzNotificationService);

  dataSource = this.nzModalData?.data;
  type = this.nzModalData?.type;

  isSpinning = false;
  refVoucherForm: FormGroup = new FormGroup({
    voucherNumberid: new FormControl('')
  })
  viewContainerRef: any;

  ngOnInit(): void {
    console.log(this.type);
  }

  printout() {
    this.pdfDownload(this.dataSource)
  }
  printout2() {
    this.pdfDownload2(this.dataSource)
  }

  pdfDownload(data: any) {
    if (this.type === 'Payment' || this.type === 'Receipt' || this.type === 'DirectPayment') {
      const modal = this.modal.create({
        nzContent: ReceiptVoucherComponent,
        nzViewContainerRef: this.viewContainerRef,
        nzWidth: "900px",
        nzFooter: [],
        nzData: { data: data.id, type: this.type },
      })
      modal.afterClose.subscribe((result: any) => {
      });
    }
    else {
      const modal = this.modal.create({
        nzContent: InvoicePdfComponent,
        nzViewContainerRef: this.viewContainerRef,
        nzWidth: "900px",
        nzFooter: [],
        nzData: { data: data.id, type: this.type },
      })
      modal.afterClose.subscribe((result: any) => {
      });
    }

  }

  pdfDownload2(data: any) {

      const modal = this.modal.create({
        nzContent: DownloadPdfNewComponent,
        nzViewContainerRef: this.viewContainerRef,
        nzWidth: "900px",
        nzFooter: [],
        nzData: { data: data.id, type: this.type },
      })
      modal.afterClose.subscribe((result: any) => {
      });

  }

  whatsapp() {
    const phoneNumber = this.dataSource.party.phoneNumber;
    const invoiceId = this.dataSource.id;
    const downloadUrl = `${environment.apiUrl}/download?type=${this.type}&id=${invoiceId}`;
    
    // Format the message with a new line before the URL
    const message = `Reliable Parts, Lasting Solutions - Driving Excellence Every Mile!\n\nDownload your Invoice: ${downloadUrl}`;
  
    console.log(phoneNumber);
    console.log(downloadUrl);
  
    window.open(`https://wa.me/+94${phoneNumber}?text=${encodeURIComponent(message)}`);
  }
  
  

  submit() {
    const selectedVoucherId = this.refVoucherForm.get('voucherNumberid')?.value;
    // Find the full voucher data by ID
    const selectedVoucher = this.dataSource.find((voucher: any) => voucher.id === selectedVoucherId);

    console.log(selectedVoucher);

    this.#modal.destroy({ data: selectedVoucher });
  }

  destroyModal(): void {
    this.#modal.destroy({ data: 'Modal Closed' });
  }
}
