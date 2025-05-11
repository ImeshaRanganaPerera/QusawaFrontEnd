import { Injectable } from '@angular/core';
import { APIResponse } from '../../shared/interface';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PartyService {

  url = environment.apiUrl;

  constructor(private httpClient: HttpClient) { }

  create(data: any): Observable<APIResponse> {
    return this.httpClient.post<APIResponse>(this.url + '/party', data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  createwithimage(data: FormData): Observable<APIResponse> {
    return this.httpClient.post<APIResponse>(this.url + '/party/imageUpload', data);
  }

  get(): Observable<APIResponse> {
    return this.httpClient.get<APIResponse>(this.url + '/party');
  }
  
  getbyId(id: any): Observable<APIResponse> {
    return this.httpClient.get<APIResponse>(this.url + '/party/' + id);
  }

  getbygroup(name: any, condition: any): Observable<APIResponse> {
    let params = new HttpParams().set('condition', condition);
    return this.httpClient.get<APIResponse>(`${this.url}/party/partygroup/${name}`, { params });
  }

  updatewithImage(id: any, data: any): Observable<APIResponse> {
    return this.httpClient.put<APIResponse>(this.url + '/party/imageUpload/' + id, data);
  }

  update(id: any, data: any): Observable<APIResponse> {
    return this.httpClient.put<APIResponse>(this.url + '/party/' + id, data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  //partyCategory
  getpartyCategory(): Observable<APIResponse> {
    return this.httpClient.get<APIResponse>(this.url + '/partyCategory');
  }

  createPartyCategory(data: any): Observable<APIResponse> {
    return this.httpClient.post<APIResponse>(this.url + '/partyCategory', data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  updatePartyCategory(id: any, data: any): Observable<APIResponse> {
    return this.httpClient.put<APIResponse>(this.url + '/partyCategory/' + id, data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  //party Type
  getpartyType(): Observable<APIResponse> {
    return this.httpClient.get<APIResponse>(this.url + '/partyType');
  }

  createPartyType(data: any): Observable<APIResponse> {
    return this.httpClient.post<APIResponse>(this.url + '/partyType', data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  updatePartyType(id: any, data: any): Observable<APIResponse> {
    return this.httpClient.put<APIResponse>(this.url + '/partyType/' + id, data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  //Get ProofImage
  getProofImageNames(): Observable<APIResponse> {
    return this.httpClient.get<APIResponse>(this.url + '/proofImage');
  }
}
