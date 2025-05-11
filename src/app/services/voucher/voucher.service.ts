import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { APIResponse } from '../../shared/interface';

@Injectable({
  providedIn: 'root'
})
export class VoucherService {

  url = environment.apiUrl;

  constructor(private httpClient: HttpClient) { }

  create(data: any): Observable<APIResponse> {
    return this.httpClient.post<APIResponse>(this.url + '/voucher', data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }
  PostStockVerification(data: any): Observable<APIResponse> {
    return this.httpClient.post<APIResponse>(this.url + '/voucher/StockVerification', data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  createBankRec(data: any): Observable<APIResponse> {
    return this.httpClient.post<APIResponse>(this.url + '/voucher/bankRec', data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  get(): Observable<APIResponse> {
    return this.httpClient.get<APIResponse>(this.url + '/voucher');
  }

  getPendingVouchers(): Observable<APIResponse> {
    return this.httpClient.get<APIResponse>(this.url + '/voucher/pendingVouchers');
  }

  getApprovedVouchers(): Observable<APIResponse> {
    return this.httpClient.get<APIResponse>(this.url + '/voucher/approvedVouchers');
  }

  getSalerepVoucher(startDate?: string, endDate?: string, userId?: any): Observable<any> {
    let params = new HttpParams();
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    if (userId) {
      params = params.set('userId', userId);
    }
    return this.httpClient.get(`${this.url}/voucher/salemenwise`, { params });
  }

  getFilteredVouchers(voucherGroupName: string, startDate?: string, endDate?: string, userId?: any, status?: any): Observable<any> {
    let params = new HttpParams();
    params = params.set('VoucherGrpName', voucherGroupName);
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    if (userId) {
      params = params.set('userId', userId);
    }
    if (status) {
      params = params.set('status', status);
    }
    return this.httpClient.get(`${this.url}/voucher/filter`, { params });
    
  }

  getBankRecVouchers(startDate?: string, endDate?: string): Observable<any> {
    let params = new HttpParams();
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    return this.httpClient.get(`${this.url}/voucher/bankRecVouchers`, { params });
  }

  getRejectInvoices(startDate?: string, endDate?: string): Observable<any> {
    let params = new HttpParams();
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    return this.httpClient.get(`${this.url}/voucher/rejectInvoices`, { params });
  }

  getFilteredVouchersByStatus(voucherGroupName: string, status?: any, userId?: any,): Observable<any> {
    let params = new HttpParams();
    params = params.set('VoucherGrpName', voucherGroupName);
    if (userId) {
      params = params.set('userId', userId);
    }
    if (status) {
      params = params.set('status', status);
    }
    return this.httpClient.get(`${this.url}/voucher/filter/status`, { params });
  }

  getOutstanding(voucherGroupName: string, partyId?: any, userId?: any,): Observable<any> {
    let params = new HttpParams();
    params = params.set('VoucherGrpName', voucherGroupName);
    if (userId) {
      params = params.set('userId', userId);
    }
    if (partyId) {
      params = params.set('partyId', partyId);
    }
    return this.httpClient.get(`${this.url}/voucher/outstanding`, { params });
  }

  getSettlement(voucherGroupName: string, partyId?: any, userId?: any,): Observable<any> {
    let params = new HttpParams();
    params = params.set('VoucherGrpName', voucherGroupName);
    if (userId) {
      params = params.set('userId', userId);
    }
    if (partyId) {
      params = params.set('partyId', partyId);
    }
    return this.httpClient.get(`${this.url}/voucher/settlement`, { params });
  }


  getRefVoucherbychartofacc(vouchergrp: any, partyId: any): Observable<any> {
    let params = new HttpParams();
    params = params.set('VoucherGrpName', vouchergrp);
    params = params.set('partyId', partyId);
    return this.httpClient.get(`${this.url}/voucher/refVoucherbyChartofacc`, { params });
  }


  getRefVoucherbyVoucherGrp(vouchergrp: any, partyId: any): Observable<any> {
    let params = new HttpParams();
    params = params.set('VoucherGrpName', vouchergrp);
    params = params.set('partyId', partyId);
    return this.httpClient.get(`${this.url}/voucher/refVoucher`, { params });
  }

  getVouchersGroupedByUserAndMonth(month?: any, year?: any): Observable<any> {
    let params = new HttpParams();
    if (month) {
      params = params.set('month', month);
    }
    if (year) {
      params = params.set('year', year);
    }
    return this.httpClient.get(`${this.url}/voucher/dashboardFigures`, { params });
  }


  getReportData(): Observable<APIResponse> {
    return this.httpClient.get<APIResponse>(this.url + '/voucher/filter');
  }

  getbyGrp(name: any): Observable<APIResponse> {
    return this.httpClient.get<APIResponse>(this.url + '/voucher/group/' + name);
  }

  getbyParty(name: any): Observable<APIResponse> {
    return this.httpClient.get<APIResponse>(this.url + '/voucher/party/' + name);
  }

  getbypartycondition(id: any, condition: any): Observable<APIResponse> {
    return this.httpClient.post<APIResponse>(this.url + '/voucher/party/condition/' + id, condition, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  getbyChartofaccCondition(id: any, condition: any): Observable<APIResponse> {
    return this.httpClient.post<APIResponse>(this.url + '/voucher/chartofAcc/condition/' + id, condition, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  getbyId(id: any): Observable<APIResponse> {
    return this.httpClient.get<APIResponse>(this.url + '/voucher/' + id);
  }

  getVoucherNumber(id: any): Observable<APIResponse> {
    return this.httpClient.get<APIResponse>(this.url + '/voucher/voucherNumber/' + id);
  }

  getStartValue(bankId: any): Observable<APIResponse> {
    return this.httpClient.get<APIResponse>(this.url + '/voucher/bankRec/startingValue/' + bankId);
  }

  update(id: any, data: any): Observable<APIResponse> {
    return this.httpClient.put<APIResponse>(this.url + '/voucher/' + id, data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  updatePending(id: any, data: any): Observable<APIResponse> {
    return this.httpClient.put<APIResponse>(this.url + '/voucher/pendingVoucherApproval/' + id, data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  updateConform(id: any, data: any): Observable<APIResponse> {
    return this.httpClient.put<APIResponse>(this.url + '/voucher/conform/' + id, data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  updateCancel(id: any, data: any): Observable<APIResponse> {
    return this.httpClient.put<APIResponse>(this.url + '/voucher/cancel/' + id, data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }


}
