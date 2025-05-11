import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { APIResponse } from '../../shared/interface';

@Injectable({
  providedIn: 'root'
})
export class ChequeService {
  url = environment.apiUrl;

  constructor(private httpClient: HttpClient) { }

  create(data: any): Observable<APIResponse> {
    return this.httpClient.post<APIResponse>(this.url + '/cheque', data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  getDebitCheque(startDate?: string, endDate?: string,): Observable<any> {
    let params = new HttpParams();
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    return this.httpClient.get(`${this.url}/cheque/filter`, { params });
  }

  get(): Observable<APIResponse> {
    return this.httpClient.get<APIResponse>(this.url + '/cheque');
  }

  getbyId(id: any): Observable<APIResponse> {
    return this.httpClient.get<APIResponse>(this.url + '/cheque/' + id);
  }

  getbyVoucherId(id: any): Observable<APIResponse> {
    return this.httpClient.get<APIResponse>(this.url + '/cheque/chequebyVoucher/' + id);
  }

  getbychequenumberBank(id: any): Observable<APIResponse> {
    return this.httpClient.get<APIResponse>(this.url + '/cheque/chequeNumber/' + id);
  }

  getUnusedChequesByAccountId(id: any): Observable<APIResponse> {
    return this.httpClient.get<APIResponse>(this.url + '/cheque/unusedCheque/' + id);
  }

  updateConform(id: any, data: any): Observable<APIResponse> {
    return this.httpClient.put<APIResponse>(this.url + '/cheque/used/' + id, data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  update(id: any, data: any): Observable<APIResponse> {
    return this.httpClient.put<APIResponse>(this.url + '/cheque/' + id, data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }
}
