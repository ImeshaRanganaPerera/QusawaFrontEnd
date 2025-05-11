

import { Component, inject } from '@angular/core';
import { MaterialModule } from '../../../../../modules/material/material.module';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { ReportPdfComponent } from '../../../../../shared/Report-Pdf/report-pdf/report-pdf.component';
import { DetailReportpdfComponent } from '../../../../../shared/detail-report-pdf/detail-reportpdf/detail-reportpdf.component';

@Component({
  selector: 'app-report-selection',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './report-selection.component.html',
  styleUrl: './report-selection.component.scss'
})
export class ReportSelectionComponent {
  isSpinning = false;
  options = ['Summarize', 'Detail wise'];
  mode: string = 'Summarize';
  data: any[] = [];
  voucherGrp!: string;
  type!: string;
  category!: string;
  startDate: any = null;
  endDate: any = null;


  modalRef = inject(NzModalRef);
  modalService = inject(NzModalService);

  ngOnInit(): void {
    const data = this.modalRef.getConfig().nzData;
    this.data = data.Data;
    this.voucherGrp = data.voucherGrp;
    this.type = data.type;
    this.category = data.category;
    console.log(this.data);
   
  }

  handleModelChange(index: number): void {
    this.mode = index === 0 ? 'Summarize' : 'Detail wise';
  }

  onButtonClick(): void {
    let modalContent: any;
  
    if (this.mode === 'Summarize') {
      modalContent = ReportPdfComponent; // Ensure it complies with the expected type
    } else {
      modalContent = DetailReportpdfComponent; // Ensure this is also of the correct type
    }
  
    const modal = this.modalService.create({
      nzContent: modalContent,
      nzWidth: "900px",
      nzFooter: null,
      nzData: {
        mode: this.mode,
        Data: this.data,
        voucherGrp: this.voucherGrp,
        type: this.type,
        category: this.category,
        startDate: this.startDate,
      }
    });
  }
}