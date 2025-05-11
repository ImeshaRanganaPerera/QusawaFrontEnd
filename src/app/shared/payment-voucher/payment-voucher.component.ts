import { Component } from '@angular/core';
import { MaterialModule } from '../../modules/material/material.module';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-payment-voucher',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './payment-voucher.component.html',
  styleUrl: './payment-voucher.component.scss'
})
export class PaymentVoucherComponent {

  // constructor(private voucherService: VoucherService) {}

  // ngOnInit(): void {
  //   this.loadVoucherData('123'); // Load the voucher with ID '123'
  // }

  // loadVoucherData(voucherId: string): void {
  //   this.voucherService.getVoucherById(voucherId).subscribe(
  //     (data: any) => {
  //       this.voucherData = data;
  //     },
  //     (error: any) => {
  //       console.error('Error loading voucher data:', error);
  //     }
  //   );
  // }

  

  title = 'PaymentVoucher';
  voucherData: any = {
    number: 'VOU-00123',
    date: '2024-09-21',
    payeeName: 'John Doe',
    payeeAddress: '123 Payee Street, City, State, ZIP',
    items: [
      { description: 'Service Payment', amount: 200 },
      { description: 'Additional Fees', amount: 50 }
    ]
  };

  downloadVoucher(): void {
    const voucherElement = document.getElementById('voucher'); // Updated ID to 'voucher'

    if (voucherElement) {
      html2canvas(voucherElement, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png'); // Get image data from canvas
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: 'a4', // Use A4 format
        });

        // Get image properties and maintain aspect ratio
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        // Add the image to the PDF
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('payment_voucher.pdf'); // Save the generated PDF
      }).catch(error => {
        console.error('Error generating PDF:', error);
      });
    } else {
      console.error('Voucher element not found');
    }
  }


}
