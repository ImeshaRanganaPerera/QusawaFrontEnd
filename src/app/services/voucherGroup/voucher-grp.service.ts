import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { APIResponse } from '../../shared/interface';

@Injectable({
  providedIn: 'root'
})
export class VoucherGrpService {
  url = environment.apiUrl;

  constructor(private httpClient: HttpClient) { }

  get(): Observable<APIResponse> {
    return this.httpClient.get<APIResponse>(this.url + '/voucherGrp');
  }
}
