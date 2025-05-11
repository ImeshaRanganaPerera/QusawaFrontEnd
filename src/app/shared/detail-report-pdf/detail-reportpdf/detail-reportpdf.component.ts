import { Component, inject, ElementRef, ViewChild } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import html2canvas from 'html2canvas';
import { MaterialModule } from '../../../modules/material/material.module';
import { DatePipe } from '@angular/common';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-detail-reportpdf',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './detail-reportpdf.component.html',
  styleUrl: './detail-reportpdf.component.scss',
  providers: [DatePipe]
})
export class DetailReportpdfComponent {
  @ViewChild('pdfContent') pdfContent!: ElementRef;

  mode!: string;
  filteredData: any[] = [];
  pages: any[][] = [];
  voucherGrp!: string;
  type!: string;
  category!: string;
  email: string = 'info@hitechlanka.lk';
  startDate: string | null = null;
  endDate: string | null = null;
  grandTotal: number = 0;

  constructor(
    private modalRef: NzModalRef,
    private notification: NzNotificationService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    const data = this.modalRef.getConfig().nzData;
    this.mode = data.mode;
    this.filteredData = data.Data;
    this.voucherGrp = data.voucherGrp;
    this.type = data.type;
    this.category = data.category;
    this.startDate = this.formatDate(data.startDate);
    this.endDate = this.formatDate(data.endDate);
    this.calculateGrandTotal();
    this.paginateData();
    console.log(this.filteredData);
  }

  paginateData(): void {
    this.pages = [];
    let currentPage: any[] = [];

    for (const item of this.filteredData) {
      if (currentPage.length >= 5) {
        this.pages.push(currentPage);
        currentPage = [];
      }
      currentPage.push(item);
    }

    if (currentPage.length > 0) {
      this.pages.push(currentPage);
    }
  }

  private formatDate(date: string | Date | null): string | null {
    if (!date) return null;
    return this.datePipe.transform(date, 'yyyy-MM-dd');
  }

  calculateGrandTotal(): void {
    this.grandTotal = this.filteredData.reduce((total, item) => 
      total + (parseFloat(item.amount) || 0), 0);
  }

  getReportTitle(): string {
    switch(this.type) {
      case 'Invoice': return 'Invoice List Report';
      case 'GRN': return 'Goods Received Note List Report';
      case 'Stock Transfer': return 'Stock Transfer List Report';
      default: return 'Report';
    }
  }

  async downloadPdf() {
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const options = {
        scale: 1.5,
        useCORS: true,
        logging: false,
        imageTimeout: 0,
        letterRendering: true,
        backgroundColor: '#ffffff',
      };

      for (let i = 0; i < this.pages.length; i++) {
        const page = this.pdfContent.nativeElement.children[i] as HTMLElement;
        const canvas = await html2canvas(page, options);
        const imgData = canvas.toDataURL('image/jpeg', 0.95);

        if (i > 0) {
          pdf.addPage();
        }

        pdf.addImage(imgData, 'JPEG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());

        // this.notification.info(
        //   'Processing PDF',
        //   `Page ${i + 1} of ${this.pages.length}`
        // );

        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const compressedPdf = await this.optimizePdfSize(pdf.output('blob'));
      const timestamp = new Date().toISOString().slice(0,10);
      const filename = `${this.type.toLowerCase()}_report_${timestamp}.pdf`;
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(compressedPdf);
      link.download = filename;
      link.click();
      
      URL.revokeObjectURL(link.href);
      
      this.notification.success(
        'PDF Generated',
        'Report has been generated and downloaded successfully.'
      );

    } catch (error) {
      console.error('PDF generation error:', error);
      this.notification.error(
        'Error',
        'Failed to generate PDF. Please try again.'
      );
    }
  }

  private async optimizePdfSize(pdfBlob: Blob): Promise<Blob> {
    return pdfBlob;
  }
}