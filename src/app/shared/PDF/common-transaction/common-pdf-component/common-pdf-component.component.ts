import { Component, inject, OnInit } from '@angular/core';
import { MaterialModule } from '../../../../modules/material/material.module';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { NzModalRef, NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { VoucherService } from '../../../../services/voucher/voucher.service';
import { PartyService } from '../../../../services/party/party.service';
import { IVoucher, APIResponse, IChequeBook, IParty } from '../../../interface';

@Component({
  selector: 'app-common-pdf-component',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './common-pdf-component.component.html',
  styleUrl: './common-pdf-component.component.scss'
})
export class CommonPdfComponentComponent implements OnInit {
  voucherService = inject(VoucherService);
  partyService = inject(PartyService);

  

  voucherData: any;
  chequeData: IChequeBook[] = [];
  supplierData: IParty[] = [];

  // Injected voucher ID through the modal
  modalRef = inject(NzModalRef);
  voucherId: string = inject(NZ_MODAL_DATA).voucherId;

  ngOnInit(): void {
    this.getVoucherById(this.voucherId);
  }

  getVoucherById(id: string): void {
    this.voucherService.getbyId(id).subscribe({
      next: (res: APIResponse) => {
        this.voucherData = res.data;
      },
      error: (err) => {
        console.error('Error fetching voucher:', err);
      }
    });
  }

  downloadReceipt(): void {
    const voucherElement = document.getElementById('Receipt');
    if (voucherElement) {
      html2canvas(voucherElement, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: 'a4',
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('transaction-receipt.pdf');
      }).catch(error => {
        console.error('Error generating PDF:', error);
      });
    }
  }

  closeModal(): void {
    this.modalRef.close();
  }

}
