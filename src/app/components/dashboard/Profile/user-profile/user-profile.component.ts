import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NzDrawerRef } from 'ng-zorro-antd/drawer';
import { NzMessageService } from 'ng-zorro-antd/message';
import { UserService } from '../../../../services/user/user.service';
import { MaterialModule } from '../../../../modules/material/material.module';
import { APIResponse } from '../../../../shared/interface';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent {
  userDetails: any;
  isLoading: boolean = false;

  constructor(
    private drawerRef: NzDrawerRef<string>,
    private message: NzMessageService,
    private userService: UserService
  ) { }

  passwordForm: FormGroup = new FormGroup({
    oldPassword: new FormControl('', [Validators.required]),
    newPassword: new FormControl('', [Validators.required]),
  })

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    this.userService.getDetail().subscribe((res: APIResponse) => {
      this.userDetails = res.data;
      console.log(this.userDetails)
    })
  }

  changePassword(): void {
    this.isLoading = true;
    const formData = this.passwordForm.value;
    const data = {
      oldPassword: formData.oldPassword,
      newPassword: formData.newPassword,
    };

    this.userService.changePassword(data).subscribe(
      (res: APIResponse) => {
        this.message.success(res.message);
        this.reset()
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
        this.message.error(error.error?.message);
      }
    );
  }

  reset() {
    this.passwordForm.reset();
    this.isLoading = false
  }

  close(): void {
    this.drawerRef.close();
  }
}
