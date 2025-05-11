import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { APIResponse } from '../../shared/interface';

@Injectable({
  providedIn: 'root'
})
export class VisitedCustomerService {
  url = environment.apiUrl;

  constructor(private httpClient: HttpClient) { }

  create(data: any): Observable<APIResponse> {
    return this.httpClient.post<APIResponse>(this.url + '/visitingCustomer', data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  get(data?: any): Observable<any> {
    let params = new HttpParams();
    if (data?.startDate) {
      params = params.set('startDate', data.startDate);
    }
    if (data?.endDate) {
      params = params.set('endDate', data.endDate);
    }
    if (data?.userId) {
      params = params.set('userId', data.userId);
    }
    return this.httpClient.get<any>(`${this.url}/visitingCustomer`, { params });
  }

  getbyId(id: any): Observable<APIResponse> {
    return this.httpClient.get<APIResponse>(this.url + '/visitingCustomer/' + id);
  }

  update(id: any, data: any): Observable<APIResponse> {
    return this.httpClient.put<APIResponse>(this.url + '/visitingCustomer/' + id, data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }
}
