import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { APIResponse } from '../../shared/interface';

@Injectable({
  providedIn: 'root'
})
export class VoucherProductService {

  url = environment.apiUrl;


  constructor(private httpClient: HttpClient) { }


  getbyGrp(id: any): Observable<APIResponse> {
    return this.httpClient.get<APIResponse>(this.url + '/voucherProduct/byvoucher/' + id);
  }

  getFilteredVouchers(productId: string, centerId: string): Observable<any> {
    let params = new HttpParams();
    params = params.set('productId', productId);
    if (productId) {
      params = params.set('centerId', centerId);
    }
    return this.httpClient.get(`${this.url}/voucherProduct/byProductCenter`, { params });
  }

  getCostofSales(startDate?: any, endDate?: any): Observable<any> {
    let params = new HttpParams();
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    return this.httpClient.get(`${this.url}/voucherProduct/costofsales`, { params });
  }
  

}

