import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { APIResponse } from '../../shared/interface';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  url = environment.apiUrl;

  constructor(private httpClient: HttpClient) { }

  create(data: any): Observable<APIResponse> {
    return this.httpClient.post<APIResponse>(this.url + '/inventory', data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  get(): Observable<APIResponse> {
    return this.httpClient.get<APIResponse>(this.url + '/inventory');
  }

  getbyCenterId(id: any): Observable<APIResponse> {
    return this.httpClient.get<APIResponse>(this.url + '/inventory/' + id);
  }

  update(id: any, data: any): Observable<APIResponse> {
    return this.httpClient.put<APIResponse>(this.url + '/inventory/' + id, data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  getStock(productId?: any, centerId?: any, date?: any): Observable<any> {
    let params = new HttpParams();
    if (centerId) {
      params = params.set('centerId', centerId);
    }
    if (productId) {
      params = params.set('productId', productId);
    }
    if (date) {
      params = params.set('date', date);
    }
    return this.httpClient.get(`${this.url}/inventory/stock`, { params });
  }

  getStockMovement(productId?: any, centerId?: any, date?: any): Observable<any> {
    let params = new HttpParams();
    if (centerId) {
      params = params.set('centerId', centerId);
    }
    if (productId) {
      params = params.set('productId', productId);
    }
    if (date) {
      params = params.set('date', date);
    }
    return this.httpClient.get(`${this.url}/inventory/stockMovement`, { params });
  }

  // updateStock(productId: any, centerId: any, quantity: any): Observable<any> {
  //   return this.httpClient.put(`${this.url}/inventory`, { productId, centerId, quantity });
  // }

  // getStock(productId?: any, centerId?: any): Observable<any> {
  //   let params = new HttpParams();
  //   if (productId) {
  //     params = params.set('productId', productId);
  //   }
  //   if (centerId) {
  //     params = params.set('centerId', centerId);
  //   }
  //   return this.httpClient.get(`${this.url}/inventory/filter`, { params });
  // }
}
