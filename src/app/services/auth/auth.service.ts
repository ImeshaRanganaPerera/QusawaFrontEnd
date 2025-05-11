import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { UserService } from '../user/user.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { APIResponse } from '../../shared/interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  responseMessage: any;

  constructor(private router: Router,
    private userService: UserService,
    private notification: NzNotificationService

  ) { }

  setToken(type: string, data: string): void {
    localStorage.setItem(type, data);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn() {
    return this.getToken() !== null;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    localStorage.removeItem('role');
    localStorage.removeItem('companyDetails');
    this.router.navigate(['login']);
  }

  login({ username, password }: any) {
    this.userService.login({ username, password }).subscribe((response: any) => {
      this.setToken('token', response.data.token);
      this.setToken('name', response.data.name);
      this.setToken('role', response.data.role);
      this.setToken('companyDetails', response.data.companyDetails);
      this.responseMessage = response.message;
      this.notification.create('success', 'Success', this.responseMessage)
      this.router.navigate(['/dashboard']);
    }, (error) => {
      this.responseMessage = error.error?.message || "Something went wrong";
      this.notification.create('error', 'Error', this.responseMessage)
    })
  }
}