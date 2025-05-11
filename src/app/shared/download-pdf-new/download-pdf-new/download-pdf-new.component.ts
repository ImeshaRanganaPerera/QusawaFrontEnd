import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { MaterialModule } from '../../../modules/material/material.module';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { NzModalRef, NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { VoucherService } from '../../../services/voucher/voucher.service';
import { APIResponse } from '../../interface';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-download-pdf-new',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './download-pdf-new.component.html',
  styleUrl: './download-pdf-new.component.scss'
})
export class DownloadPdfNewComponent {

  readonly #modal = inject(NzModalRef);
  readonly nzModalData: any = inject(NZ_MODAL_DATA);
  voucherService = inject(VoucherService)
  private cdRef = inject(ChangeDetectorRef);
  voucherData: any;
  email: string = 'info@hitechlanka.lk';
  userPhoneNumber: any
  type = this.nzModalData.type;
  mode: any

  ngOnInit(): void {
    console.log(this.type)
    if (this.nzModalData?.data) {
      this.getVoucherDatabyID(this.nzModalData?.data)
      console.log(this.nzModalData?.data)
    }
    if (this.type === 'Sales Return' || this.type === 'Invoice' || this.type === 'Sales Order' || this.type === 'INVOICE' || this.type === 'SALES-RETURN' || this.type === 'SALES-ORDER') {
      this.mode = 'recivable';
    }
    else {
      this.mode = 'payable';
    }
    console.log(this.mode)
    console.log(this.type)
  }

  getVoucherDatabyID(id: string): void {
    this.voucherService.getbyId(id).subscribe((res: APIResponse) => {
      this.voucherData = res.data;
      console.log(res.data)
      this.userPhoneNumber = this.voucherData.user.phoneNumber;
    }, (error) => {
      console.error('Error fetching voucher data:', error);
    });
  }

  getSubtotal(): number {
    if (!this.voucherData?.voucherProduct) {
      return 0;
    }
    return this.voucherData.voucherProduct.reduce(
      (subtotal: number, product: any) => subtotal + (product.quantity * this.getDiscountRate(product.discount, this.mode === 'payable' ? product.cost : product.MRP)),
      0
    );
  }

  getTotal(): number {
    const subtotal = this.getSubtotal();
    const discount = this.voucherData?.voucherProduct?.discount;
    if (!discount) {
      return subtotal;
    }
    if (discount > 1) {
      return subtotal - (subtotal * discount);
    } else {
      return subtotal - discount;
    }
  }

  getDiscountRate(discount: string | number, MRP: number): number {
    if (discount === '' || discount === null || discount === undefined) {
      return MRP;
    }
    if (typeof discount === 'string' && discount.includes('%')) {
      const discountValue = parseFloat(discount.replace('%', ''));
      return MRP - (MRP * (discountValue / 100)); // MRP - percentage discount
    }
    // If discount is a number or string without '%', treat it as a fixed discount
    const fixedDiscount = typeof discount === 'number' ? discount : parseFloat(discount);
    return MRP - fixedDiscount; // Subtract fixed discount from MRP
  }

  getAmount(product: any): number {
    if (this.mode === 'payable') {
      const rate = this.getDiscountRate(product.discount, product.cost);
      return rate * product.quantity; // Calculate total amount with the adjusted rate
    }
    else {
      const rate = this.getDiscountRate(product.discount, product.MRP);
      return rate * product.quantity; // Calculate total amount with the adjusted rate
    }
  }


  downloadInvoice() {
    const invoiceElement = document.getElementById('invoice'); // Capture the invoice element
    if (invoiceElement) {
      html2canvas(invoiceElement).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4'); // PDF size is A4 in portrait mode
        const imgWidth = 210; // Full width of A4 page
        const pageHeight = 295; // Full height of A4 page
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
        pdf.save('invoice.pdf');
      });
    }
  }

  // downloadInvoice2() {
  //   const invoiceElement = document.getElementById('invoice'); // Capture the invoice element
  //   if (invoiceElement) {
  //     html2canvas(invoiceElement).then(canvas => {
  //       const imgData = canvas.toDataURL('image/png');
  //       const pdf = new jsPDF('p', 'mm',  [279.4, 241.3]); // PDF size is in portrait mode
  //       const imgWidth = 241.3; // Full width of A4 page
  //       const pageHeight = 279.4; // Full height of A4 page
  //       const imgHeight = (canvas.height * imgWidth) / canvas.width;
  //       let heightLeft = imgHeight;
  //       let position = 0;

  //       pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  //       heightLeft -= pageHeight;

  //       while (heightLeft >= 0) {
  //         position = heightLeft - imgHeight;
  //         pdf.addPage();
  //         pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  //         heightLeft -= pageHeight;
  //       }
  //       pdf.save('invoice.pdf');
  //     });
  //   }
  // }

  downloadInvoice2() {
    const invoiceElement = document.getElementById('invoice'); // Capture the invoice element
    if (invoiceElement) {
      // Use html2canvas with high resolution
      html2canvas(invoiceElement, {
        scale: 3, // Increase scale for better resolution (default is 1)
        useCORS: true, // Enable CORS if your images or styles require it
        logging: true, // Enable logging for debugging if necessary
      }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png',1.0);
        const pdf = new jsPDF('p', 'mm', [279.4, 241.3]); // PDF size is in portrait mode (Letter size)
        
        const imgWidth = 241.3; // Full width of the PDF page
        const pageHeight = 279.4; // Full height of the PDF page
        const imgHeight = (canvas.height * imgWidth) / canvas.width; // Calculate image height
        let heightLeft = imgHeight;
        let position = 0;
  
        // Add the first page
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
  
        // Add subsequent pages if content exceeds one page
        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
  
        // Save the PDF
        pdf.save('invoice.pdf');
      });
    }
  }
  

}
