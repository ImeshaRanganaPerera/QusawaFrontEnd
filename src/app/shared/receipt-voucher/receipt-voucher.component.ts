import { Component, inject } from '@angular/core';
import { MaterialModule } from '../../modules/material/material.module';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { VoucherService } from '../../services/voucher/voucher.service';
import { IVoucher, APIResponse, IParty, IChequeBook } from '../interface';
import { PartyService } from '../../services/party/party.service';
import { ChequeService } from '../../services/cheque/cheque.service';

@Component({
  selector: 'app-receipt-voucher',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './receipt-voucher.component.html',
  styleUrls: ['./receipt-voucher.component.scss']
})

export class ReceiptVoucherComponent {
  title = 'Payment Voucher';
  email: string = 'info@qaswa.lk';

  voucherService = inject(VoucherService)
  partyService = inject(PartyService)
  chequeService = inject(ChequeService)

  voucherData: any;
  chequeNumber: any;
  chequeReleaseDate: any;
  chequeData: any;
  supplier: IParty[] = [];
  data: any[] | undefined;
  readonly #modal = inject(NzModalRef);
  readonly nzModalData: any = inject(NZ_MODAL_DATA);

  type = this.nzModalData?.type
  ngOnInit(): void {
    this.getChequeData();
    if (this.nzModalData?.data) {
      this.getVoucherDatabyID(this.nzModalData?.data)
    }
    console.log(this.type);
  }

  getVoucherDatabyID(id: string): void {
    this.voucherService.getbyId(id).subscribe((res: APIResponse) => {
      this.voucherData = res.data;
      console.log(this.voucherData);
    }, (error) => {
      console.error('Error fetching voucher data:', error);
    });
  }

  getChequeData() {
    this.chequeService.getbyVoucherId(this.nzModalData?.data).subscribe((res: any) => {
      this.chequeData = res.data;
      if (this.chequeData) {
        this.chequeNumber = this.chequeData?.chequeNumber;
        this.chequeReleaseDate = this.chequeData?.releaseDate;
      }
    })
  }

  getSupplierById(supplierId: string) {
    this.partyService.getbyId(supplierId).subscribe((res: APIResponse) => {
      this.data = res.data;
      console.log('Supplier Data:', this.supplier);
    }, (error) => {
      console.error('Error fetching supplier:', error);
    });
  }

  downloadInvoice() {
    const invoice = document.getElementById('invoice');

    if (invoice) {
      html2canvas(invoice, { scale: 2 }).then((canvas) => {

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: [794, 1123],
        });


        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = 794;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;


        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('invoice.pdf');
      });
    }
  }
}