import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { MaterialModule } from '../../modules/material/material.module';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { NzModalRef, NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { VoucherService } from '../../services/voucher/voucher.service';
import { IVoucher, APIResponse } from '../interface';

@Component({
  selector: 'app-invoice-pdf',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './invoice-pdf.component.html',
  styleUrl: './invoice-pdf.component.scss'
})
export class InvoicePdfComponent {
  readonly #modal = inject(NzModalRef);
  readonly nzModalData: any = inject(NZ_MODAL_DATA);
  voucherService = inject(VoucherService)
  private cdRef = inject(ChangeDetectorRef);
  voucherData: any;
  email: string = 'info@qaswa.lk';
  userPhoneNumber: any
  type = this.nzModalData.type;
  mode: any
$index: any;
amountInWords:any;
  ngOnInit(): void {
    console.log(this.type)
    if (this.nzModalData?.data) {
      this.getVoucherDatabyID(this.nzModalData?.data)
      console.log(this.nzModalData?.data)
    }
  this.amountInWords = this.amountToWords(this.getSubtotal());
    if (this.type === 'Sales Return' || this.type === 'Invoice' || this.type === 'Sales Order' || this.type === 'INVOICE' || this.type === 'SALES-RETURN' || this.type === 'SALES-ORDER') {
      this.mode = 'recivable';
    }
    else {
      this.mode = 'payable';
    }
    console.log(this.mode)
    console.log(this.type)
  }
amountToWords(value: number): string {
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if ((value = +value.toFixed(2)) === 0) return 'Zero';

  let number = Math.floor(value);
  const fraction = Math.round((value - number) * 100);

  const numToWords = (n: number): string => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + numToWords(n % 100) : '');
    if (n < 1000000) return numToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + numToWords(n % 1000) : '');
    if (n < 1000000000) return numToWords(Math.floor(n / 1000000)) + ' Million' + (n % 1000000 ? ' ' + numToWords(n % 1000000) : '');
    return numToWords(Math.floor(n / 1000000000)) + ' Billion' + (n % 1000000000 ? ' ' + numToWords(n % 1000000000) : '');
  };

  const words = numToWords(number);
  const centPart = fraction ? ` and ${numToWords(fraction)} Cents` : '';

  return `${words}${centPart} Only`;
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
}
