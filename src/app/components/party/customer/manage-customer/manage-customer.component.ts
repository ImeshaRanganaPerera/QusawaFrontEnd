import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MaterialModule } from '../../../../modules/material/material.module';
import { APIResponse, IParty, IPartyCategory, IPartyType } from '../../../../shared/interface';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { NzModalRef, NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { PartyService } from '../../../../services/party/party.service';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from '../../../../../environments/environment';
import { GoogleMap, MapMarker } from "@angular/google-maps";

@Component({
  selector: 'app-manage-customer',
  standalone: true,
  imports: [MaterialModule, GoogleMap, MapMarker],
  templateUrl: './manage-customer.component.html',
  styleUrl: './manage-customer.component.scss'
})
export class ManageCustomerComponent implements OnInit {
  readonly #modal = inject(NzModalRef);
  readonly nzModalData: any = inject(NZ_MODAL_DATA);
  notification = inject(NzNotificationService);
  partyservice = inject(PartyService)

  action = this.nzModalData?.action;

  isSpinning = false;
  responseMessage: any;
  partyList: any[] = [];
  categoryList: any[] = [];
  typeList: any[] = [];

  // Variables to hold file objects
  shopImageFile: File | null = null;
  nicImageFile: File | null = null;
  brImageFile: File | null = null;
  nicBackImageFile: File | null = null;

  shopImageUrl: string | null = null;
  nicImageUrl: string | null = null;
  brImageUrl: string | null = null;
  nicBackImageUrl: string | null = null;

  isVerified = false;
  role: any;

  partyForm: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.partyForm = this.formBuilder.group({
      name: new FormControl('', [Validators.required]),
      nic: new FormControl(''),
      phoneNumber: new FormControl('', [Validators.required, Validators.minLength(9), Validators.maxLength(10), Validators.pattern(/^[0-9]*$/)]),
      address1: new FormControl('', [Validators.required]),
      city: new FormControl(''),
      address2: new FormControl(''),
      creditValue: new FormControl(''),
      creditPeriod: new FormControl(''),
      email: new FormControl(''),
      partyCategoryId: new FormControl('', [Validators.required]),
      partyTypeId: new FormControl('', [Validators.required]),
    });

    this.partyForm.get('address1')?.valueChanges.subscribe(address => {
      this.addMarkerFromAddress(address);
    });
  }

  ngOnInit(): void {
    this.getRole();
    this.isSpinning = true;
    if (this.nzModalData?.data) {
      this.partyForm.patchValue(this.nzModalData.data);
      if (this.role === 'SALESMEN') {
        Object.keys(this.partyForm.controls).forEach((key) => {
          this.partyForm.controls[key].disable();
        });
      }

      if (this.nzModalData.data.shopImage) {
        this.shopImageUrl = environment.fileUrl + ((this.nzModalData.data.shopImage).replace('public','')).replace('/uploads','');
      }
      if (this.nzModalData.data.nicImage) {
        this.nicImageUrl = environment.fileUrl + ((this.nzModalData.data.nicImage).replace('public','')).replace('/uploads','');
      }
      if (this.nzModalData.data.BRimage) {
        this.brImageUrl = environment.fileUrl + ((this.nzModalData.data.BRimage).replace('public','')).replace('/uploads','');
      }
      if (this.nzModalData.data.nicBackImage) {
        this.nicBackImageUrl = environment.fileUrl + ((this.nzModalData.data.nicBackImage).replace('public','')).replace('/uploads','');
      }
    }
    console.log(this.action)
    this.getCategory()
    this.getType()
  }

  getRole() {
    this.role = localStorage.getItem('role')
  }

  getCategory() {
    this.partyservice.getpartyCategory().subscribe((res: APIResponse) => {
      this.categoryList = res.data;
      this.isSpinning = false;
    })
  }

  getType() {
    this.partyservice.getpartyType().subscribe((res: APIResponse) => {
      this.typeList = res.data;
      this.isSpinning = false;
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

  submit() {
    if (this.partyForm.invalid) {
      Object.values(this.partyForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    if (this.role === 'SALESMEN') {
      if (!this.shopImageFile && !this.shopImageUrl) {
        this.notification.create('error', 'Error', 'Please upload shop image');
        return;
      }
    }

    this.isSpinning = true;
    if (this.action === 'Approval') {
      this.isVerified = true;
    }
    if (this.role !== 'SALESMEN') {
      this.isVerified = true;
    }

    // Create FormData and append form fields
    const formData = new FormData();
    const formValues = this.partyForm.value;

    let phoneNumber = String(formValues.phoneNumber);
    if (phoneNumber.startsWith('0')) {
      phoneNumber = phoneNumber.substring(1); // Remove the first character
    }

    console.log(phoneNumber)

    formData.append('name', formValues.name);
    formData.append('nic', formValues.nic || '');
    formData.append('phoneNumber', phoneNumber);
    formData.append('address1', formValues.address1);
    formData.append('city', formValues.city);
    formData.append('address2', formValues.address2);
    formData.append('creditValue', String(formValues.creditValue));
    formData.append('creditPeriod', String(formValues.creditPeriod));
    formData.append('email', formValues.email || '');
    formData.append('partyCategoryId', formValues.partyCategoryId);
    formData.append('partyTypeId', formValues.partyTypeId);
    formData.append('isVerified', this.isVerified === true ? 'true' : 'false');
    formData.append('partyGroup', 'CUSTOMER');

    // Append files if they exist
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

    // Log form data for debugging
    // console.log('FormData content:');
    // formData.forEach((value, key) => {
    //   console.log(key, value);
    // });

    // Submit the form based on action (Create or Update)
    const observable$: Observable<APIResponse> = this.action === 'Create'
      ? this.partyservice.createwithimage(formData)
      : this.partyservice.updatewithImage(this.nzModalData?.data?.id, formData);

    this.handleSubmit(observable$);
  }

  handleSubmit(observable$: Observable<APIResponse>) {
    observable$.subscribe(
      (res: APIResponse) => {
        this.responseMessage = res.message;
        this.isSpinning = false;
        this.#modal.destroy({ message: this.responseMessage, data: res.data });
      },
      (error) => {
        this.responseMessage = error.error?.message || 'Something went wrong!';
        this.isSpinning = false;
        this.notification.create('error', 'Error', this.responseMessage);
      }
    );
  }

  destroyModal(): void {
    this.#modal.destroy({ data: 'Modal Closed' });
  }

  onLocationSelected(location: { address: string, city: string }) {
    this.partyForm.patchValue({
      address1: location.address,
      city: location.city,
    });
  }

  markerOptions: google.maps.MarkerOptions = { draggable: false };
  @ViewChild(GoogleMap, { static: false }) map!: GoogleMap;

  markerPositions: google.maps.LatLngLiteral[] = [];

  addMarkerFromAddress(address: string) {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const position = results[0].geometry.location.toJSON();
        this.markerPositions = [position];

        // Create a marker (using either AdvancedMarkerElement or regular Marker)
        if (google.maps.marker && google.maps.marker.AdvancedMarkerElement) {
          new google.maps.marker.AdvancedMarkerElement({
            position,
            map: this.map.googleMap,
            title: 'Selected Location'
          });
        } else {
          new google.maps.Marker({
            position,
            map: this.map.googleMap,
            title: 'Selected Location'
          });
        }

        // Update the city field if available
        const cityComponent = results[0].address_components.find(component =>
          component.types.includes('locality') || component.types.includes('administrative_area_level_2')
        );
        if (cityComponent) {
          this.partyForm.patchValue({ city: cityComponent.long_name });
        }
      } else {
        console.error('Geocoder failed due to:', status);
        this.notification.create('error', 'Error', 'Failed to retrieve location for the entered address');
      }
    });
  }

  latitude = 6.9271;  // Default latitude (Colombo)
  longitude = 79.8612;
  options: google.maps.MapOptions = {
    center: { lat: this.latitude, lng: this.longitude },
    zoom: 10
  };
}
