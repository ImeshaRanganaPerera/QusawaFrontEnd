import { Component, inject, OnInit } from '@angular/core';
import { MaterialModule } from '../../../../modules/material/material.module';
import { PartyService } from '../../../../services/party/party.service';
import { APIResponse, IParty } from '../../../../shared/interface';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { VisitedCustomerService } from '../../../../services/visitedCustomer/visited-customer.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Observable } from 'rxjs/internal/Observable';

@Component({
  selector: 'app-manage-visiting-customer',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './manage-visiting-customer.component.html',
  styleUrl: './manage-visiting-customer.component.scss'
})
export class ManageVisitingCustomerComponent implements OnInit {

  isSpinning = false;
  partyData: any[] = [];
  filteredParty: any[] = [];
  categoryList: any[] = [];
  typeList: any[] = [];
  responseMessage: any
  inputValue?: string;
  mode?: string = 'existing';

  partyService = inject(PartyService)
  visitedCustomerService = inject(VisitedCustomerService)
  notification = inject(NzNotificationService)

  visitedCustomerForm: FormGroup = new FormGroup({
    partyname: new FormControl('', [Validators.required]),
    note: new FormControl(''),
    partyTypeId: new FormControl(''),
    name: new FormControl(''),
    phoneNumber: new FormControl(''),
    address1: new FormControl(''),
    city: new FormControl(''),
    partyCategoryId: new FormControl('')
  })

  selectedCustomer: any;

  shopImageFile: File | null = null;
  nicImageFile: File | null = null;
  brImageFile: File | null = null;
  nicBackImageFile: File | null = null;

  shopImageUrl: string | null = null;
  nicImageUrl: string | null = null;
  brImageUrl: string | null = null;
  nicBackImageUrl: string | null = null;

  ngOnInit(): void {
    this.getParty();
    this.getCategory();
    this.visitedCustomerForm.get('partyname')?.valueChanges.subscribe(value => {
      if (value) {
        this.selectedCustomer = this.partyData.find(party => party.name === value);
        console.log(this.selectedCustomer)
      }
    })
  }

  onFileChange(event: any, fileType: string) {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const imageUrl = reader.result as string;
      if (fileType === 'shopImage') {
        this.shopImageFile = file;
        this.shopImageUrl = imageUrl;
      } else if (fileType === 'nicImage') {
        this.nicImageFile = file;
        this.nicImageUrl = imageUrl;
      } else if (fileType === 'brImage') {
        this.brImageFile = file;
        this.brImageUrl = imageUrl;
      } else if (fileType === 'nicBackImage') {
        this.nicBackImageFile = file;
        this.nicBackImageUrl = imageUrl;
      }
    };
    reader.readAsDataURL(file);
  }


  getCategory() {
    this.partyService.getpartyCategory().subscribe((res: APIResponse) => {
      this.categoryList = res.data;
      this.isSpinning = false;
    })
  }

  getParty() {
    this.partyService.get().subscribe((res: APIResponse) => {
      this.partyData = res.data;
      this.isSpinning = false;
    }, (error) => {
      // this.notification.create('error', 'Error', error.error?.message || 'Something went wrong!')
    })
  }

  onInput(e: Event): void {
    const value = (e.target as HTMLInputElement).value.trim().toLowerCase();
    this.filteredParty = this.partyData.filter(party =>
      party.name?.toLowerCase().includes(value)
    );
  }

  getType() {
    if (this.typeList.length === 0) {
      this.isSpinning = true;
      this.partyService.getpartyType().subscribe((res: APIResponse) => {
        this.typeList = res.data;
        console.log(this.typeList)
        this.isSpinning = false;
      })
    }
  }

  onTabClick(modes: any) {
    this.mode = modes
    if (this.mode === 'existing') {
      this.visitedCustomerForm.get('phoneNumber')?.clearValidators();
      this.visitedCustomerForm.get('phoneNumber')?.updateValueAndValidity();
      this.visitedCustomerForm.get('name')?.clearValidators();
      this.visitedCustomerForm.get('name')?.updateValueAndValidity();

      this.visitedCustomerForm.get('partyname')?.setValidators([Validators.required]);
      this.visitedCustomerForm.get('partyname')?.updateValueAndValidity();

    }
    else {
      this.visitedCustomerForm.get('phoneNumber')?.setValidators([Validators.required, Validators.minLength(9), Validators.maxLength(10), Validators.pattern(/^[0-9]*$/)]);
      this.visitedCustomerForm.get('phoneNumber')?.updateValueAndValidity();
      this.visitedCustomerForm.get('name')?.setValidators([Validators.required]);
      this.visitedCustomerForm.get('name')?.updateValueAndValidity();

      this.visitedCustomerForm.get('partyname')?.clearValidators();
      this.visitedCustomerForm.get('partyname')?.updateValueAndValidity();
      this.getType();
    }
    console.log(modes)
  }

  submit() {
    if (this.visitedCustomerForm.invalid) {
      Object.values(this.visitedCustomerForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      })
      return;
    }
    const formData = new FormData();
    const formValues = this.visitedCustomerForm.value;

    this.isSpinning = true;
    var data;
    if (this.mode === 'existing') {
      const selectedCustomername = this.visitedCustomerForm.get('partyname')?.value;
      if (selectedCustomername) {
        const selectedCustomer = this.partyData.find(party => party.name === selectedCustomername);
        if (selectedCustomer) {
          data = {
            partyId: selectedCustomer.id,
            note: formValues.note,
            type: 'EXISTING',
            status: 'Visited'
          }
        } else {
          this.isSpinning = false;
          this.notification.create('error', 'Error', 'Customer not found!')
          return;
        }
      }
    }
    else {

      if (!this.shopImageFile && !this.shopImageUrl) {
        this.isSpinning = false;
        this.notification.create('error', 'Error', 'Please upload shop image');
        return;
      }

      formData.append('name', formValues.name);
      formData.append('phoneNumber', String(formValues.phoneNumber));
      formData.append('address1', formValues.address1);
      formData.append('city', formValues.city);
      formData.append('partyCategoryId', formValues.partyCategoryId);
      formData.append('partyTypeId', formValues.partyTypeId);
      formData.append('isVerified', 'false');
      formData.append('partyGroup', 'CUSTOMER');
      formData.append('note', formValues.note);
      formData.append('visitingCustomer', JSON.stringify({
        note: formValues.note,
        status: 'Visited',
        type: 'NEW',
      }));

      if (this.shopImageFile) {
        formData.append('shopImage', this.shopImageFile);
      }
      if (this.nicImageFile) {
        formData.append('nicImage', this.nicImageFile);
      }
      if (this.brImageFile) {
        formData.append('brImage', this.brImageFile);
      }
      if (this.nicBackImageFile) {
        formData.append('nicBackImage', this.nicBackImageFile);
      }
    }

    console.log('FormData content:');
    formData.forEach((value, key) => {
      console.log(key, value);
    });

    this.mode === "existing" ? this.handleSubmit(this.visitedCustomerService.create(data))
      : this.handleSubmit(this.partyService.createwithimage(formData));
  }

  handleSubmit(observable$: Observable<APIResponse>) {
    observable$.subscribe((res: APIResponse) => {
      this.responseMessage = res.message;
      this.isSpinning = false;
      this.resetForm()
    }, (error) => {
      this.responseMessage = error.error?.message || 'Something went Wrong!'
      this.isSpinning = false;
      this.notification.create('error', 'Error', this.responseMessage)
    })
  }

  resetForm() {
    this.visitedCustomerForm.reset();
    this.shopImageFile = null;
    this.nicImageFile = null;
    this.brImageFile = null;
    this.nicBackImageFile = null;

    this.shopImageUrl = null;
    this.nicImageUrl = null;
    this.brImageUrl = null;
    this.nicBackImageUrl = null;
  }

}
