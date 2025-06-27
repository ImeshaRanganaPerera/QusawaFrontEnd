import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
 url = environment.apiUrl;
  constructor(private httpClient: HttpClient) { }

    get(amount: number, from: string): Observable<{
      amountLkr: number; amountInUSD: number 
}> {
    const params = new HttpParams().set('amount', amount).set('from', from);
   return this.httpClient.get<{ amountInUSD: number, amountLkr:number }>(`${this.url}/Currency`, { params });

  }
}
