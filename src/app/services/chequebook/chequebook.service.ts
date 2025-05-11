import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { APIResponse } from '../../shared/interface';

@Injectable({
  providedIn: 'root'
})
export class ChequebookService {
  url = environment.apiUrl;

  constructor(private httpClient: HttpClient) { }

  create(data: any): Observable<APIResponse> {
    return this.httpClient.post<APIResponse>(this.url + '/chequebook', data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  get(): Observable<APIResponse> {
    return this.httpClient.get<APIResponse>(this.url + '/chequebook');
  }

  getbyId(id: any): Observable<APIResponse> {
    return this.httpClient.get<APIResponse>(this.url + '/chequebook/' + id);
  }

  update(id: any, data: any): Observable<APIResponse> {
    return this.httpClient.put<APIResponse>(this.url + '/chequebook/' + id, data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }
}
