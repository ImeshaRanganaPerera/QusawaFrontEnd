import { Component, inject } from '@angular/core';
import { MaterialModule } from '../../../modules/material/material.module';
import { UserService } from '../../../services/user/user.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NzModalRef, NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Observable } from 'rxjs';
import { APIResponse } from '../../../shared/interface';
import { CenterService } from '../../../services/center/center.service';

@Component({
  selector: 'app-manage-user',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './manage-user.component.html',
  styleUrl: './manage-user.component.scss'
})
export class ManageUserComponent {

  readonly #modal = inject(NzModalRef);
  readonly nzModalData: any = inject(NZ_MODAL_DATA);
  notification = inject(NzNotificationService);
  userService = inject(UserService);
  centerservice = inject(CenterService);

  isSpinning = false;
  action = this.nzModalData?.action;
  responseMessage: any;
  dataSource: any[] = []; // Holds fetched centers
  isManager = false;
  isEdit = false; // Toggle center list visibility

  // Add 'centerIds' FormControl to handle selected centers
  userForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    nic: new FormControl(''),
    phoneNumber: new FormControl(''),
    address: new FormControl(''),
    dateofbirth: new FormControl(''),
    username: new FormControl(''),
    password: new FormControl(''),
    role: new FormControl(''),
    target: new FormControl(''),
    centerIds: new FormControl([]) // To store selected center IDs
  });

  ngOnInit(): void {
    if (this.nzModalData?.data) {
      this.userForm.patchValue(this.nzModalData.data);
      this.isEdit = true;
    }

    this.userForm.get('role')?.valueChanges.subscribe((role) => {
      if (role === 'MANAGER') {
        this.getByCenter();
      }
    });

    this.userForm.get('role')?.valueChanges.subscribe((role) => {
      if (role === 'SALESMEN') {
        this.userForm.get('target')?.setValidators([Validators.required]);
        this.userForm.get('target')?.updateValueAndValidity();
      }
    });
  }

  // Fetch centers for Manager role
  getByCenter() {
    this.isSpinning = true; // Start the spinner when fetching centers
    this.centerservice.getbycentermode("PHYSICAL").subscribe(
      (res: APIResponse) => {
        this.dataSource = res.data;
        this.isSpinning = false;
      },
      (error) => {
        this.isSpinning = false;
        this.notification.create('error', 'Error', 'Failed to fetch centers.');
      }
    );
  }

  onCenterSelect(event: any, centerId: string): void {
    const selectedCenters = this.userForm.get('centerIds')?.value || [];

    if (event.target.checked) {
      this.userForm.patchValue({ centerIds: [...selectedCenters, centerId] });
    } else {
      this.userForm.patchValue({ centerIds: selectedCenters.filter((id: string) => id !== centerId) });
    }

    console.log("Selected centers:", this.userForm.get('centerIds')?.value);
  }

  submit() {
    if (this.userForm.invalid) {
      Object.values(this.userForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    const formdata = this.userForm.value;

    // Check if the user is a Manager and validate centerIds
    if (formdata.role === 'MANAGER' && formdata.centerIds.length === 0) {
      this.notification.create('error', 'Validation Error', 'Please select at least one center.');
      return;
    }

    this.isSpinning = true;

    // Transform centerIds into the required format
    const centers = formdata.centerIds.map((centerId: any) => ({ centerId }));
    var data = {
      name: formdata.name,
      nic: formdata.nic,
      phoneNumber: String(formdata.phoneNumber),
      address: formdata.address,
      dateofbirth: formdata.dateofbirth,
      username: formdata.username,
      password: formdata.password,
      role: formdata.role,
      target: formdata.target || 0,
      centers // Use the transformed centers array
    };

    this.action === "Create"
      ? this.handleSubmit(this.userService.create(data))
      : this.handleSubmit(this.userService.update(this.nzModalData?.data?.id, data));
  }


  handleSubmit(observable$: Observable<APIResponse>) {
    observable$.subscribe((res: APIResponse) => {
      this.responseMessage = res.message;
      this.isSpinning = false;
      console.log(res.data)
      this.#modal.destroy({ message: this.responseMessage, data: res.data });
    }, (error) => {
      this.responseMessage = error.error?.message || 'Something went wrong!';
      this.isSpinning = false;
      this.notification.create('error', 'Error', this.responseMessage);
    });
  }

  destroyModal(): void {
    this.#modal.destroy({ data: 'Modal Closed' });
  }
}
