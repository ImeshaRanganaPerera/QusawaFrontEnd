import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { APIResponse } from '../../shared/interface';

@Injectable({
  providedIn: 'root'
})
export class ChartofAccService {
  url = environment.apiUrl;

  constructor(private httpClient: HttpClient) { }

  //chartofacc
  createChartofacc(data: any): Observable<APIResponse> {
    return this.httpClient.post<APIResponse>(this.url + '/chartofAcc', data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  getChartofacc(): Observable<APIResponse> {
    return this.httpClient.get<APIResponse>(this.url + '/chartofAcc');
  }

  getbyChartofaccId(id: any): Observable<APIResponse> {
    return this.httpClient.get<APIResponse>(this.url + '/chartofAcc/' + id);
  }

  
  getChartofaccbyGrp(name: any): Observable<APIResponse> {
    return this.httpClient.get<APIResponse>(this.url + '/chartofAcc/getbyGroup/' + name);
  }

  getChartofaccbyCategory(name: any): Observable<APIResponse> {
    return this.httpClient.get<APIResponse>(this.url + '/chartofAcc/getbycategory/' + name);
  }

  getChartofaccBalance(name: any): Observable<APIResponse> {
    return this.httpClient.get<APIResponse>(this.url + '/chartofAcc/chartofaccSum/' + name);
  }

  getMakeDepositAcc(): Observable<APIResponse> {
    return this.httpClient.get<APIResponse>(this.url + '/chartofAcc/makeDepositacc');
  }


  updateChartofacc(id: any, data: any): Observable<APIResponse> {
    return this.httpClient.put<APIResponse>(this.url + '/chartofAcc/' + id, data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  //Account Group
  createAccountGroup(data: any): Observable<APIResponse> {
    return this.httpClient.post<APIResponse>(this.url + '/accGroup', data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  getAccountGroup(): Observable<APIResponse> {
    return this.httpClient.get<APIResponse>(this.url + '/accGroup');
  }

  getbyAccountGroupId(id: any): Observable<APIResponse> {
    return this.httpClient.get<APIResponse>(this.url + '/accGroup/' + id);
  }

  updateAccountGroup(id: any, data: any): Observable<APIResponse> {
    return this.httpClient.put<APIResponse>(this.url + '/accGroup/' + id, data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  //Account Category
  createAccCategory(data: any): Observable<APIResponse> {
    return this.httpClient.post<APIResponse>(this.url + '/accCategory', data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  getAccCategory(): Observable<APIResponse> {
    return this.httpClient.get<APIResponse>(this.url + '/accCategory');
  }

  getbyAccCategoryId(id: any): Observable<APIResponse> {
    return this.httpClient.get<APIResponse>(this.url + '/accCategory/' + id);
  }

  updateAccCategory(id: any, data: any): Observable<APIResponse> {
    return this.httpClient.put<APIResponse>(this.url + '/accCategory/' + id, data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  //Account Sub Category
  createAccSubcategory(data: any): Observable<APIResponse> {
    return this.httpClient.post<APIResponse>(this.url + '/accSubCategory', data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  getAccSubcategory(): Observable<APIResponse> {
    return this.httpClient.get<APIResponse>(this.url + '/accSubCategory');
  }

  getbyAccSubcategoryId(id: any): Observable<APIResponse> {
    return this.httpClient.get<APIResponse>(this.url + '/accSubCategory/' + id);
  }

  updateAccSubcategory(id: any, data: any): Observable<APIResponse> {
    return this.httpClient.put<APIResponse>(this.url + '/accSubCategory/' + id, data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }
}
