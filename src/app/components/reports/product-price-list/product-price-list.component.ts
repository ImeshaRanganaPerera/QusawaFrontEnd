import { Component, inject, ViewContainerRef } from '@angular/core';
import { MaterialModule } from '../../../modules/material/material.module';
import { FormControl } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ProductService } from '../../../services/product/product.service';
import { APIResponse } from '../../../shared/interface';

@Component({
  selector: 'app-product-price-list',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './product-price-list.component.html',
  styleUrl: './product-price-list.component.scss'
})
export class ProductPriceListComponent {
  isSpinning = true;
  loading = false;

  searchControl: FormControl = new FormControl('');
  dataSource: any[] = [];
  filteredData: any[] = [];
  discountLevels: string[] = [];
  role: any;

  //services
  model = inject(NzModalService)
  viewContainerRef = inject(ViewContainerRef)
  notification = inject(NzNotificationService)
  productservice = inject(ProductService)

  currentPage = 1;
  pageSize = 100;

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  ngOnInit(): void {
    this.setupSearch();
    this.getProductDiscount();
    this.getRole();
  }

  getRole() {
    this.role = localStorage.getItem('role')
  }

  setupSearch() {
    this.searchControl.valueChanges.subscribe((searchTerm) => {
      this.filteredData = this.dataSource.filter((product: any) =>
        product.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }

  getProductDiscount() {
    this.productservice.productDiscountList().subscribe((response: any) => {
      const { level, product } = response.data;
      this.dataSource = product;
      this.filteredData = product;
      this.discountLevels = level; // Set discount levels for the table header
      this.isSpinning = false;
    }, (error) => {
      console.error(error);
      this.isSpinning = false;
    });
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

  getrate(product: any, type: string): any {
    if (type === 'COST') {
      const rate = this.getDiscountRate(product.discount, product.MRP);
      return (((rate - product.cost) / product.cost) * 100).toFixed(2);
    }
    else {
      const rate = this.getDiscountRate(product.discount, product.MRP);
      return (((rate - product.cost) / rate) * 100).toFixed(2);
    }
  }
}

