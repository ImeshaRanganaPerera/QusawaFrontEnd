import { Component, inject, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { MaterialModule } from './../../modules/material/material.module';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface CustomerSummary {
  name: string;
  totalAmount: number;
  totalPaid: number;
  outstanding: number;
  salesman: string;
}

@Component({
  selector: 'app-outstanding-summery',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './outstanding-summery.component.html',
  styleUrl: './outstanding-summery.component.scss'
})

export class OutstandingSummeryComponent implements AfterViewInit {
  @ViewChild('pdfContent', { static: false }) pdfContent!: ElementRef;

  

  mode!: string;
  filteredData: any[] = [];
  voucherGrp!: string;
  type!: string;
  category!: string;
  email: string = 'info@qaswa.lk';
  pages: any[][] = [];
  isGeneratingPdf = false;
  customerSummary: CustomerSummary[] = [];
  modalRef = inject(NzModalRef);
  notification = inject(NzNotificationService);

  ngOnInit(): void {
    const data = this.modalRef.getConfig().nzData;
    this.mode = data.mode;
    this.filteredData = data.Data;
    this.voucherGrp = data.voucherGrp;
    this.type = data.type;
    this.category = data.category;
    console.log(data)
     this.generateCustomerSummary(data.Data);

  }


  ngAfterViewInit(): void {
    this.paginateData();
  }
generateCustomerSummary(allInvoices: any[]) {
  const grouped: { [key: string]: CustomerSummary } = {};

  for (const invoice of allInvoices) {
    const name = invoice.party?.name || 'Unknown';
    if (!grouped[name]) {
      grouped[name] = {
        name,
        totalAmount: 0,
        totalPaid: 0,
        outstanding: 0,
        salesman: invoice.user?.name || ''
      };
    }

    grouped[name].totalAmount += invoice.amount || 0;
    grouped[name].totalPaid += invoice.paidValue || 0;
    grouped[name].outstanding += (invoice.amount - invoice.paidValue) || 0;
  }

  this.customerSummary = Object.values(grouped);
}
  paginateData(): void {
    const itemsPerPage = 15;
    this.pages = [];
    for (let i = 0; i < this.filteredData.length; i += itemsPerPage) {
      this.pages.push(this.filteredData.slice(i, i + itemsPerPage));
    }
  }

  private async generatePageCanvas(pageElement: HTMLElement): Promise<HTMLCanvasElement> {
    const options = {
      scale: 1.5,
      useCORS: true,
      allowTaint: true,
      logging: false,
      imageTimeout: 0,
      removeContainer: true,
      letterRendering: false,
      quality: 0.8
    };

    return await html2canvas(pageElement, options);
  }

  private compressImage(canvas: HTMLCanvasElement): string {
    return canvas.toDataURL('image/jpeg', 0.7);
  }

  async downloadPdf(): Promise<void> {
    if (this.isGeneratingPdf) {
      this.notification.warning('Please wait', 'PDF generation is in progress');
      return;
    }

    try {
      this.isGeneratingPdf = true;
      this.notification.info('Processing', 'Generating PDF, please wait...');

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4',
        compress: true
      });

      // Set PDF metadata with correct property names
      pdf.setProperties({
        title: `${this.voucherGrp}_Report`,
        author: 'HITECH LANKA',
        subject: `${this.voucherGrp} Report - ${this.mode}`,
        keywords: 'report, invoice',
        // Creator: 'HITECH LANKA PDF Generator',
        // Producer: 'HITECH LANKA System'
      });

      for (let i = 0; i < this.pages.length; i++) {
        const pageElement = document.getElementById(`page-${i}`);
        if (pageElement) {
          // Process pages in chunks to prevent memory issues
          if (i > 0 && i % 5 === 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }

          const canvas = await this.generatePageCanvas(pageElement);
          const imgData = this.compressImage(canvas);

          if (i > 0) {
            pdf.addPage();
          }

          const imgProps = pdf.getImageProperties(imgData);
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

          pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

          // Clean up to free memory
          canvas.remove();
          console.log(pageElement)
        }
      }

      // Save with compression
      const fileName = `${this.voucherGrp}_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      this.notification.success('Success', 'PDF generated successfully');
    } catch (error) {
      console.error('PDF generation error:', error);
      this.notification.error('Error', 'Failed to generate PDF. Please try again.');
    } finally {
      this.isGeneratingPdf = false;
    }
  }
}
