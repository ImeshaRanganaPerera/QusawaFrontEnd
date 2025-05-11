import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APIResponse } from '../../shared/interface';

@Injectable({
  providedIn: 'root'
})
export class CommissionReportService {
  url = environment.apiUrl;

  constructor(private httpClient: HttpClient) { }

  get(): Observable<APIResponse> {
    return this.httpClient.get<APIResponse>(this.url + '/commissionReport');
  }

  getSalerepVoucher(startDate?: string, endDate?: string, userId?: any): Observable<any> {
    let params = new HttpParams();
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    if (userId) {
      params = params.set('userId', userId);
    }
    return this.httpClient.get(`${this.url}/commissionReport/commissionReportSalemanwise`, { params });
  }
}
