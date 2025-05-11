import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { APIResponse } from '../../shared/interface';

@Injectable({
  providedIn: 'root'
})
export class CenterService {
  url = environment.apiUrl;

  constructor(private httpClient: HttpClient) { }

  create(data: any): Observable<APIResponse> {
    return this.httpClient.post<APIResponse>(this.url + '/center', data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  get(): Observable<APIResponse> {
    return this.httpClient.get<APIResponse>(this.url + '/center');
  }

  getbyId(id: any): Observable<APIResponse> {
    return this.httpClient.get<APIResponse>(this.url + '/center/' + id);
  }

  getbycentermode(mode: any): Observable<APIResponse> {
    return this.httpClient.get<APIResponse>(this.url + '/center/centerMode/' + mode);
  }

  getCenterbyUser(): Observable<APIResponse> {
    return this.httpClient.get<APIResponse>(this.url + '/userCenter/byuser');
  }

  update(id: any, data: any): Observable<APIResponse> {
    return this.httpClient.put<APIResponse>(this.url + '/center/' + id, data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }
}
