import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { APIResponse } from '../../shared/interface';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  url = environment.apiUrl;

  constructor(private httpClient: HttpClient) { }

  create(data: any): Observable<APIResponse> {
    return this.httpClient.post<APIResponse>(this.url + '/users', data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  get(): Observable<APIResponse> {
    return this.httpClient.get<APIResponse>(this.url + '/users');
  }

  getDetail(): Observable<APIResponse> {
    return this.httpClient.get<APIResponse>(this.url + '/users/details');
  }

  getbyId(id: any): Observable<APIResponse> {
    return this.httpClient.get<APIResponse>(this.url + '/users/' + id);
  }

  getbyRole(name: any): Observable<APIResponse> {
    return this.httpClient.get<APIResponse>(this.url + '/users/role/' + name);
  }

  update(id: any, data: any): Observable<APIResponse> {
    return this.httpClient.put<APIResponse>(this.url + '/users/' + id, data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  login(data: any): Observable<APIResponse> {
    return this.httpClient.post<APIResponse>(this.url + '/users/login', data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    })
  }

  changePassword(data: any): Observable<APIResponse> {
    return this.httpClient.put<APIResponse>(this.url + '/users/change-password', data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  deleteUser(id: any): Observable<APIResponse> {
    return this.httpClient.put<APIResponse>(this.url + '/users/deleteUser/' + id, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }
}
