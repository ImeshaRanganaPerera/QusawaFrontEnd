import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'getPaymentAmount',
  standalone: true
})
export class GetPaymentAmountPipe implements PipeTransform {
  transform(paymentVouchers: any[] | undefined, paymentType: string): number {
    if (!Array.isArray(paymentVouchers) || paymentVouchers.length === 0) {
      return 0; // Return 0 if the input is not an array or is empty
    }
    const payment = paymentVouchers.find(pv => pv.paymentType === paymentType);
    return payment ? payment.amount : 0; // Return the amount if found, otherwise return 0
  }
}
