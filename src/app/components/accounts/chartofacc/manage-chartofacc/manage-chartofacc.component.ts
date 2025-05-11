import { Component, inject } from '@angular/core';
import { MaterialModule } from '../../../../modules/material/material.module';
import { ChartofAccService } from '../../../../services/chartofAcc/chartof-acc.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NzModalRef, NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Observable } from 'rxjs';
import { APIResponse } from '../../../../shared/interface';

@Component({
  selector: 'app-manage-chartofacc',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './manage-chartofacc.component.html',
  styleUrl: './manage-chartofacc.component.scss'
})
export class ManageChartofaccComponent {
  readonly #modal = inject(NzModalRef);
  readonly nzModalData: any = inject(NZ_MODAL_DATA);
  notification = inject(NzNotificationService);
  chartofaccService = inject(ChartofAccService)

  action = this.nzModalData?.action;
  param = this.nzModalData?.param
  name: string = '';
  id: any;

  isSpinning = true;
  responseMessage: any;
  accCategoryList: any[] = [];
  accSubCategoryList: any[] = [];
  accGroupList: any[] = [];

  accForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    accsubCategoryId: new FormControl(''),
    accCategoryId: new FormControl(''),
    accGroupId: new FormControl(''),
    Opening_Balance: new FormControl(''),
  })
  

  ngOnInit(): void {
    this.isSpinning = true;
    if (this.nzModalData?.param) {
      if (this.param === "Category") {
        this.name = "Account Category"
        this.getAcccategory()

        this.accForm.get('accCategoryId')?.setValidators([Validators.required]);
        this.accForm.get('accCategoryId')?.updateValueAndValidity();

        if (this.nzModalData?.data) {
          this.accForm.patchValue({
            accCategoryId: this.nzModalData?.data.accountCategoryId,
            name: this.nzModalData?.data.accountSubName
          });
          this.id = this.nzModalData?.data.id;
        }
      }
      else if (this.param === "Group") {
        this.isSpinning = false;
        this.name = "Account Group"
        if (this.nzModalData?.data) {
          this.accForm.patchValue({
            name: this.nzModalData?.data.accountGroupName,
          });
          this.id = this.nzModalData?.data.id;
        }
      }
      else if (this.param === "Account") {
        this.name = "Chart of Account"
        this.getSubAccCategory()
        this.getSubAccGroup()

        // Add validators to accGroupId and accsubCategoryId when param is "Account"
        this.accForm.get('accGroupId')?.setValidators([Validators.required]);
        this.accForm.get('accsubCategoryId')?.setValidators([Validators.required]);

        // Update value and validity after setting validators
        this.accForm.get('accGroupId')?.updateValueAndValidity();
        this.accForm.get('accsubCategoryId')?.updateValueAndValidity();

        if (this.nzModalData?.data) {
          this.accForm.patchValue({
            name: this.nzModalData?.data.accountName,
            accsubCategoryId: this.nzModalData?.data.accountSubCategoryId,
            accGroupId: this.nzModalData?.data.accountGroupId,
            Opening_Balance: this.nzModalData?.data.Opening_Balance
          });
          this.id = this.nzModalData?.data.id;
        }
      }
    }
  }

  getAcccategory() {
    this.chartofaccService.getAccCategory().subscribe((res: APIResponse) => {
      this.responseMessage = res.message;
      this.accCategoryList = res.data
      this.isSpinning = false;
    }, (error) => {
      this.responseMessage = error.error?.message || 'Something went Wrong!'
      this.isSpinning = false;
      this.notification.create('error', 'Error', this.responseMessage)
    })
  }

  getSubAccCategory() {
    this.chartofaccService.getAccSubcategory().subscribe((res: APIResponse) => {
      this.responseMessage = res.message;
      this.accSubCategoryList = res.data
      this.isSpinning = false;
    }, (error) => {
      this.responseMessage = error.error?.message || 'Something went Wrong!'
      this.isSpinning = false;
      this.notification.create('error', 'Error', this.responseMessage)
    })
  }

  getSubAccGroup() {
    this.chartofaccService.getAccountGroup().subscribe((res: APIResponse) => {
      this.responseMessage = res.message;
      this.accGroupList = res.data
      this.isSpinning = false;
    }, (error) => {
      this.responseMessage = error.error?.message || 'Something went Wrong!'
      this.isSpinning = false;
      this.notification.create('error', 'Error', this.responseMessage)
    })
  }

  submit() {
    if (this.accForm.invalid) {
      Object.values(this.accForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      })
      return;
    }

    var formdata = this.accForm.value;
    var data;
    this.isSpinning = true;
    if (this.action === "Create") {
      if (this.param === "Category") {
        data = {
          accountCategoryId: formdata.accCategoryId,
          accountSubName: formdata.name
        }
        this.handleSubmit(this.chartofaccService.createAccSubcategory(data))
      }
      else if (this.param === "Group") {
        data = {
          accountGroupName: formdata.name
        }
        this.handleSubmit(this.chartofaccService.createAccountGroup(data))
      }
      else if (this.param === "Account") {
        data = {
          accountName: formdata.name,
          accountSubCategoryId: formdata.accsubCategoryId,
          accountGroupId: formdata.accGroupId,
          Opening_Balance: formdata.Opening_Balance
        }
        this.handleSubmit(this.chartofaccService.createChartofacc(data))
      }
    }
    if (this.action === "Update") {
      if (this.param === "Category") {
        data = {
          accountCategoryId: formdata.accCategoryId,
          accountSubName: formdata.name
        }
        console.log(this.id)
        this.handleSubmit(this.chartofaccService.updateAccSubcategory(this.id, data))
      }
      else if (this.param === "Group") {
        data = {
          accountGroupName: formdata.name
        }
        this.handleSubmit(this.chartofaccService.updateAccountGroup(this.id, data))
      }
      else if (this.param === "Account") {
        data = {
          accountName: formdata.name,
          accountSubCategoryId: formdata.accsubCategoryId,
          accountGroupId: formdata.accGroupId,
          Opening_Balance: formdata.Opening_Balance
        }
        console.log(data)
        this.handleSubmit(this.chartofaccService.updateChartofacc(this.id, data))
      }
    }
  }

  handleSubmit(observable$: Observable<APIResponse>) {
    observable$.subscribe((res: APIResponse) => {
      this.responseMessage = res.message;
      this.isSpinning = false;
      this.#modal.destroy({ message: this.responseMessage, data: res.data });
    }, (error) => {
      this.responseMessage = error.error?.message || 'Something went Wrong!'
      this.isSpinning = false;
      this.notification.create('error', 'Error', this.responseMessage)
    })
  }

  destroyModal(): void {
    this.#modal.destroy({ message: 'Modal Closed' });
  }

}
