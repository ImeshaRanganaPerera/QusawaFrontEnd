import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { APIResponse } from '../../shared/interface';

@Injectable({
  providedIn: 'root'
})
export class ProductService {


  url = environment.apiUrl;

  constructor(private httpClient: HttpClient) { }

  create(data: any): Observable<APIResponse> {
    return this.httpClient.post<APIResponse>(this.url + '/product', data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  get(): Observable<APIResponse> {
    return this.httpClient.get<APIResponse>(this.url + '/product');
  }

  getbyId(id: any): Observable<APIResponse> {
    return this.httpClient.get<APIResponse>(this.url + '/product/' + id);
  }

  update(id: any, data: any): Observable<APIResponse> {
    return this.httpClient.put<APIResponse>(this.url + '/product/' + id, data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  updateStatus(id: any, data: any): Observable<APIResponse> {
    return this.httpClient.put<APIResponse>(this.url + '/product/productStatus/' + id, data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  priceUpdate(id: any, data: any): Observable<APIResponse> {
    return this.httpClient.put<APIResponse>(this.url + '/product/productPriceUpdate/' + id, data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  productDiscountList() {
    return this.httpClient.get<APIResponse>(this.url + '/product/discounts');
  }




}
