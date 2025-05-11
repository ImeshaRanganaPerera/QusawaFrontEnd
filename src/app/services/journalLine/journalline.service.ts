import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { APIResponse } from '../../shared/interface';

@Injectable({
  providedIn: 'root'
})
export class JournallineService {
  url = environment.apiUrl;

  constructor(private httpClient: HttpClient) { }

  create(data: any): Observable<APIResponse> {
    return this.httpClient.post<APIResponse>(this.url + '/jornalLine', data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  get(): Observable<APIResponse> {
    return this.httpClient.get<APIResponse>(this.url + '/jornalLine');
  }

  getbyId(id: any): Observable<APIResponse> {
    return this.httpClient.get<APIResponse>(this.url + '/jornalLine/' + id);
  }

  getbyref(ref: any): Observable<APIResponse> {
    return this.httpClient.get<APIResponse>(this.url + '/jornalLine/ref/' + ref);
  }

  getFilteredJournalline(chartofaccid?: string, startDate?: string, endDate?: string): Observable<any> {
    let params = new HttpParams();
    if (chartofaccid) {
      params = params.set('chartofAccountId', chartofaccid);
    }
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    return this.httpClient.get(`${this.url}/jornalLine/filter`, { params });
  }

  getBankJournalLines(chartofaccid?: string, endDate?: string): Observable<any> {
    let params = new HttpParams();
    if (chartofaccid) {
      params = params.set('chartofAccountId', chartofaccid);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    return this.httpClient.get(`${this.url}/jornalLine/bankRec`, { params });
  }

  getTrialBalance(endDate?: string): Observable<any> {
    let params = new HttpParams();
    // if(chartofaccid){
    //   params = params.set('chartofAccountId', chartofaccid);
    // }
    // if (startDate) {
    //   params = params.set('startDate', startDate);
    // }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    return this.httpClient.get(`${this.url}/jornalLine/trialBalance`, { params });
  }

  getProfitLoss(startDate?: string, endDate?: string): Observable<any> {
    let params = new HttpParams();
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    return this.httpClient.get(`${this.url}/jornalLine/profitandlost`, { params });
  }

  getBalanceSheet(date: string): Observable<any> {
    let params = new HttpParams();
    if (date) {
      params = params.set('endDate', date);
    }
    return this.httpClient.get(`${this.url}/jornalLine/balanceSheet`, { params });
  }

  update(id: any, data: any): Observable<APIResponse> {
    return this.httpClient.put<APIResponse>(this.url + '/jornalLine/' + id, data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }
}
