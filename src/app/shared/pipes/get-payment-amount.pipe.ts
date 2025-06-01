import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'getPaymentAmount',
  standalone: true
})
export class GetPaymentAmountPipe implements PipeTransform {
transform(paymentVoucher: any[] | undefined, paymentType: string): number {
    if (!Array.isArray(paymentVoucher)) return 0;

    return paymentVoucher
      .filter(pv => pv?.paymentType === paymentType)
      .reduce((sum, pv) => sum + Number(pv?.amount || 0), 0);
  }
}
