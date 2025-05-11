

import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CenterService } from '../../../../services/center/center.service';
import { ProductService } from '../../../../services/product/product.service';
import { ICenter, IProduct, APIResponse } from '../../../../shared/interface';
import { MaterialModule } from '../../../../modules/material/material.module';
import { differenceInCalendarDays } from 'date-fns';
  
  @Component({
  selector: 'app-manage-filter',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './manage-filter.component.html',
  styleUrls: ['./manage-filter.component.scss']
  })
  export class ManageFilterComponent implements OnInit {
    filterForm!: FormGroup;
    centers: ICenter[] = [];
    products: IProduct[] = [];
    isLoading = false;
  
    private fb = inject(FormBuilder);
    private router = inject(Router);
    private centerService = inject(CenterService);
    private productService = inject(ProductService);
    today = new Date();
    ngOnInit() {
      this.initForm();
      this.loadCenters();
      this.loadProducts();
    }
  
    initForm() {
      this.filterForm = this.fb.group({
        date: [new Date()],
        centerMode: ['all'],
        itemMode: ['all'],
        centerId: [''],
        productId: ['']
      });
  
      this.filterForm.get('centerMode')?.valueChanges.subscribe(value => {
        if (value === 'one') {
          this.filterForm.get('centerId')?.enable();
        } else {
          this.filterForm.get('centerId')?.disable();
        }
      });
  
      this.filterForm.get('itemMode')?.valueChanges.subscribe(value => {
        if (value === 'one') {
          this.filterForm.get('productId')?.enable();
        } else {
          this.filterForm.get('productId')?.disable();
        }
      });
    }
  
    loadCenters() {
      this.centerService.get().subscribe((res: APIResponse) => {
        this.centers = res.data;
      });
    }
  
    loadProducts() {
      this.productService.get().subscribe((res: APIResponse) => {
        this.products = res.data;
      });
    }
  
    onSubmit() {
      if (this.filterForm.valid) {
        const { centerMode, itemMode, centerId, productId } = this.filterForm.value;
        let route = '/dashboard';
  
        if (centerMode === 'all' && itemMode === 'all') {
          route += '/allcentersproducts';
        } else if (centerMode === 'all' && itemMode === 'one') {
          route += `/allcentersoneproducts/${productId}`;
        } else if (centerMode === 'one' && itemMode === 'all') {
          route += `/onecentersproducts/${centerId}`;
        } else {
          route += `/onecentersproducts/${centerId}/${productId}`;
        }
  
        this.router.navigate([route], { queryParams: { date: this.filterForm.value.date } });
      }
    }

    disabledDate = (current: Date): boolean =>
      // Can not select days before today and today
      differenceInCalendarDays(current, this.today) > 0;
  
  }