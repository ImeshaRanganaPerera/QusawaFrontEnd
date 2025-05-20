import { Component, inject, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { PartyService } from '../../../../services/party/party.service';
import { UserService } from '../../../../services/user/user.service';
import { VoucherService } from '../../../../services/voucher/voucher.service';
import { APIResponse } from '../../../../shared/interface';
import { ReportSelectionComponent } from '../../../vouchers/transaction/report-selection/report-selection/report-selection.component';
import { VoucherProductService } from '../../../../services/voucherProduct/voucher-product.service';
import { MaterialModule } from '../../../../modules/material/material.module';
import { differenceInCalendarDays } from 'date-fns';
import { InventoryService } from '../../../../services/inventory/inventory.service';
import { CenterService } from '../../../../services/center/center.service';
import { ProductService } from '../../../../services/product/product.service';

@Component({
  selector: 'app-stock-list-report',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './stock-list-report.component.html',
  styleUrls: ['./stock-list-report.component.scss']
})

export class StockListReportComponent {

  isSpinning = false;
  isSpinning2 = false;
  searchControl: FormControl = new FormControl('');
  dateRange!: FormGroup;
  dataSource: any;
  filteredData: any;
  voucherProduct: any[] = [];
  userList: any[] = [];
  partyList: any[] = [];
  type: any;
  partytype: any;
  voucherType: any;
  role: any;
  isBlocked: boolean = false;
  isStockMovement: boolean = false;
  totalAmount: number = 0;
  totalOutstanding: number = 0;
  totalpaidValue: number = 0;
  today = new Date();
  productName: any
  centerName: any
  totalQuantity: any

  centerList: any[] = [];
  productList: any[] = [];
  stockData: any[] = [];
  stockMovementData: any[] = [];
  filteredStockData: any[] = [];
  groupedStockMovementData: { batchNo: string; records: any[] }[] = [];
  pagesize = 100;

  viewContainerRef = inject(ViewContainerRef);
  voucherService = inject(VoucherService);
  centerService = inject(CenterService);
  productService = inject(ProductService);
  route = inject(ActivatedRoute);

  stockReportForm: FormGroup = new FormGroup({
    centerId: new FormControl(''),
    productId: new FormControl(''),
    date: new FormControl(''),
    quantity: new FormControl(''),
  })

  constructor(
    private modal: NzModalService,
    private notification: NzNotificationService,
    private inventoryService: InventoryService,
  ) { }

  ngOnInit(): void {
    this.getRole();
    this.setupSearch()
    this.getStock()
    this.getCenters();
    this.getProducts();
  }

  getRole() {
    this.role = localStorage.getItem('role')
  }

  setupSearch() {
    // Subscribe to the searchControl's value changes
    this.searchControl.valueChanges.subscribe((searchTerm) => {
      const search = searchTerm.toLowerCase();

      // Filter the dataSource based on centerName or product's printName
      this.filteredData = this.dataSource.map((center: any) => {
        const filteredProducts = center.products.filter((product: any) =>
          product.productName.toLowerCase().includes(search)
        );

        // Include the center if the name matches or there are any filtered products
        if (center.centerName.toLowerCase().includes(search) || filteredProducts.length > 0) {
          return {
            ...center,
            products: filteredProducts.length > 0 ? filteredProducts : center.products
          };
        }
      }).filter((center: any) => center != null); // Filter out null values (unmatched centers)

      this.calculateProductTotals();
    });
  }


  getCenters() {
    this.centerService.get().subscribe((res: APIResponse) => {
      this.centerList = res.data;
    });
    // if (this.role === 'SALESMEN') {
    //   this.centerService.getbycentermode('PHYSICAL').subscribe((res: APIResponse) => {
    //     this.centerList = res.data;
    //   });
    // }
    // else {
    // }
  }

  getProducts() {
    this.productService.get().subscribe((res: APIResponse) => {
      this.productList = res.data;
    });
  }

  getStock() {
    this.isSpinning = true;
    this.inventoryService.getStock().subscribe(
      (res: any) => {
        const stockData = res.data;
        console.log(stockData)
        // Assuming res.data has the structure you're working with
        this.dataSource = Object.entries(stockData).map(([centerName, products]) => ({
          centerName,
          products
        }));
        this.filteredData = Object.entries(stockData).map(([centerName, products]) => ({
          centerName,
          products
        }));
        this.dataSource = this.filteredData
        this.isSpinning = false;
        this.calculateProductTotals();
      },
      (error) => {
        this.notification.error('Error', 'Failed to fetch stock data');
        this.isSpinning = false;
      }
    );


  }

  // stockMovement(data: any) {
  //   this.isStockMovement = !this.isStockMovement
  //   this.isSpinning = true;
  //   const productId = data.productId
  //   const centerId = data.centerId
  //   const date = this.stockReportForm.get('date')?.value;

  //   this.productList.map((product: any) => {
  //     if (product.id === productId) {
  //       this.productName = product.printName
  //     }
  //   })

  //   this.centerList.map((center: any) => {
  //     if (center.id === centerId) {
  //       this.centerName = center.centerName
  //     }
  //   })

  //   this.stockMovementData = []
  //   this.inventoryService.getStockMovement(productId, centerId, date).subscribe((res: APIResponse) => {
  //     this.stockMovementData = res.data;
  //     this.pagesize = this.stockMovementData.length
  //     this.calculateTotal();
  //     this.isSpinning = false;
  //   })
  // }
  stockMovement(data: any) {
  this.isStockMovement = !this.isStockMovement;
  this.isSpinning = true;

  const productId = data.productId;
  const centerId = data.centerId;
  const date = this.stockReportForm.get('date')?.value;

  // Get selected product and center name
  const selectedProduct = this.productList.find((product: any) => product.id === productId);
  const selectedCenter = this.centerList.find((center: any) => center.id === centerId);

  this.productName = selectedProduct?.printName || '';
  this.centerName = selectedCenter?.centerName || '';

  this.stockMovementData = [];
  this.groupedStockMovementData = []; // <-- Clear previous batch groups

this.inventoryService.getStockMovement(productId, centerId, date).subscribe((res: any) => {
  console.log('Grouped stock movement object:', res);

  const stockArray: any[] = [];

 this.groupedStockMovementData = Object.entries(res.data).map(([batchNo, records]) => ({
    batchNo,
    records: records as any[]
  }));

  this.stockMovementData = stockArray;
  this.pagesize = stockArray.length;

  this.calculateTotal();
  this.isSpinning = false;
});


}


  calculateTotal() {
  const allRecords = this.groupedStockMovementData.flatMap(batch => batch.records);

  const qtyIn = allRecords.reduce((sum, stock) => sum + (stock.qtyIn || 0), 0);
  const qtyOut = allRecords.reduce((sum, stock) => sum + (stock.qtyOut || 0), 0);

  this.totalQuantity = qtyIn - qtyOut;
  }

  changeStock() {
    this.isStockMovement = !this.isStockMovement
  }

  onBack() {
    this.isStockMovement = !this.isStockMovement
  }

  applyFilters() {
    this.filteredData = []
    this.stockMovementData = []
    var centerId = this.stockReportForm.get('centerId')?.value;
    var productId = this.stockReportForm.get('productId')?.value;
    var date = this.stockReportForm.get('date')?.value;

    this.productList.map((product: any) => {
      if (product.id === productId) {
        this.productName = product.printName
      }
    })

    this.centerList.map((center: any) => {
      if (center.id === centerId) {
        this.centerName = center.centerName
      }
    })

    this.isSpinning = true;
    if (this.isStockMovement === false) {
      this.inventoryService.getStock(productId, centerId, date).subscribe((res: any) => {
        const stockData = res.data;

        // Assuming res.data has the structure you're working with
        this.filteredData = Object.entries(stockData).map(([centerName, products]) => ({
          centerName,
          products
        }));
        this.dataSource = this.filteredData
        this.isSpinning = false;
        console.log(this.filteredData)
      },
        (error) => {
          this.notification.error('Error', 'Failed to fetch stock data');
          this.isSpinning = false;
        }
      );
    }
    else {
      this.stockMovementData = []
      this.inventoryService.getStockMovement(productId, centerId, date).subscribe((res: APIResponse) => {
        this.stockMovementData = res.data;
        this.calculateTotal();
        this.isSpinning = false;
      })
    }
    this.calculateProductTotals();
  }

  productTotals: { [productName: string]: number } = {};

  calculateProductTotals() {
    this.productTotals = {}; // Reset totals
  
    this.filteredData.forEach((center: any) => {
      center.products.forEach((product: any) => {
        if (this.productTotals[product.productName]) {
          this.productTotals[product.productName] += Number(product.quantity);
        } else {
          this.productTotals[product.productName] = Number(product.quantity);
        }
      });
    });
  }


  disabledDate = (current: Date): boolean =>
    // Can not select days before today and today
    differenceInCalendarDays(current, this.today) > 0;
}
