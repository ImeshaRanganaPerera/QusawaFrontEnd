import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MaterialModule } from '../../../../modules/material/material.module';

interface SaleItem {
  product: string;
  quantity: number;
  amount: number;
}

interface SalesData {
  invoiceNumber: string;
  invoiceDate: Date;
  items: SaleItem[];
  totalAmount: number;
  paymentMode: 'Cash' | 'Card' | 'Online';
}

@Component({
  selector: 'app-combined-sales-report',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './combined-sales-report.component.html',
  styleUrls: ['./combined-sales-report.component.scss']
})
export class CombinedSalesReportComponent implements OnInit {
  dateForm: FormGroup;
  allSalesData: SalesData[] = [
    {
      invoiceNumber: 'INV001',
      invoiceDate: new Date(),
      items: [
        { product: 'Widget A', quantity: 2, amount: 500 },
        { product: 'Gadget B', quantity: 1, amount: 300 }
      ],
      totalAmount: 800,
      paymentMode: 'Cash',
    },
    {
      invoiceNumber: 'INV002',
      invoiceDate: new Date(),
      items: [
        { product: 'Gizmo C', quantity: 1, amount: 1000 },
        { product: 'Widget A', quantity: 3, amount: 750 }
      ],
      totalAmount: 1750,
      paymentMode: 'Card'
    }
  ];

  filteredSalesData: SalesData[] = [];
  expandedInvoices: Set<string> = new Set();
  description: string = '';

  constructor(private fb: FormBuilder) {
    this.dateForm = this.fb.group({
      selectedDate: [new Date().toISOString().split('T')[0]],
      description: ['']
    });
  }

  ngOnInit() {
    this.filterData();
  }

  filterData() {
    const selectedDate = new Date(this.dateForm.value.selectedDate);
    this.filteredSalesData = this.allSalesData.filter(sale => 
      sale.invoiceDate.toDateString() === selectedDate.toDateString()
    );
  }

  toggleExpand(invoiceNumber: string) {
    if (this.expandedInvoices.has(invoiceNumber)) {
      this.expandedInvoices.delete(invoiceNumber);
    } else {
      this.expandedInvoices.add(invoiceNumber);
    }
  }

  isExpanded(invoiceNumber: string): boolean {
    return this.expandedInvoices.has(invoiceNumber);
  }

  isHighlighted(invoiceNumber: string): boolean {
    return this.isExpanded(invoiceNumber);
  }

  getTotalQuantity(items: SaleItem[]): number {
    return items.reduce((total, item) => total + item.quantity, 0);
  }

  getPaymentTotals(): { [key: string]: number } {
    const totals: { [key: string]: number } = { Cash: 0, Card: 0, Online: 0 };
    this.filteredSalesData.forEach(sale => {
      totals[sale.paymentMode] += sale.totalAmount;
    });
    return totals;
  }

  downloadReport() {
    this.description = this.dateForm.value.description;
    // Add your logic for downloading the report here, including the description
    console.log("Description:", this.description);
  }
}
