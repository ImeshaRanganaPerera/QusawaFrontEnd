import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APIResponse } from '../../shared/interface';

@Injectable({
  providedIn: 'root'
})
export class ReferVoucherService {

  url = environment.apiUrl;

  constructor(private httpClient: HttpClient) { }

  getReferVouchers(id: any): Observable<APIResponse> {
    return this.httpClient.get<APIResponse>(this.url + '/referVoucher/byvoucher/' + id);
  }
  
}
