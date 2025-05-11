import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { APIResponse } from '../../shared/interface';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class TypeService {
  url = environment.apiUrl;

  constructor(private httpClient: HttpClient) { }

  create(data: any): Observable<APIResponse> {
    return this.httpClient.post<APIResponse>(this.url + '/type', data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  get(): Observable<APIResponse> {
    return this.httpClient.get<APIResponse>(this.url + '/type');
  }

  getbyId(id: any): Observable<APIResponse> {
    return this.httpClient.get<APIResponse>(this.url + '/type/' + id);
  }

  update(id: any, data: any): Observable<APIResponse> {
    return this.httpClient.put<APIResponse>(this.url + '/type/' + id, data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }
}
