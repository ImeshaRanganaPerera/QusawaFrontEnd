import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from '../../components/dashboard/dashboard.component';
import { DashComponent } from '../../components/dashboard/dash/dash.component';
import { ProductListComponent } from '../../components/product master/product/product-list/product-list.component';
import { BrandListComponent } from '../../components/product master/brand/brand-list/brand-list.component';
import { TypeListComponent } from '../../components/product master/type/type-list/type-list.component';
import { CustomerListComponent } from '../../components/party/customer/customer-list/customer-list.component';
import { SupplierListComponent } from '../../components/party/supplier/supplier-list/supplier-list.component';
import { CenterListComponent } from '../../components/center/center-list/center-list.component';
import { InvoicePdfComponent } from '../../shared/invoice-pdf/invoice-pdf.component';
import { StockListReportComponent } from '../../components/reports/stocks/stock-list-report/stock-list-report.component';
import { TransactionComponent } from '../../components/vouchers/transaction/transaction.component';
import { UserListComponent } from '../../components/users/user-list/user-list.component';
import { CombinedSalesReportComponent } from '../../components/vouchers/sales/combined-sales-report/combined-sales-report.component';
import { ProfitReportComponent } from '../../components/vouchers/sales/profit-report/profit-report.component';
import { SalesmanReportComponent } from '../../components/vouchers/sales/salesman-report/salesman-report.component';
import { CreateUtilityBillComponent } from '../../components/accounts/create-utility-bill/create-utility-bill.component';
import { ManageJournalEntryComponent } from '../../components/accounts/manage-journal-entry/manage-journal-entry.component';
import { ManagePaymentReceiptComponent } from '../../components/accounts/manage-payment-receipt/manage-payment-receipt.component';
import { ListPettyCashComponent } from '../../components/accounts/Petty-cash/list-petty-cash/list-petty-cash.component';
import { ListChartofaccComponent } from '../../components/accounts/chartofacc/list-chartofacc/list-chartofacc.component';
import { SupplierEnterBillComponent } from '../../components/accounts/supplier-enter-bill/supplier-enter-bill.component';
import { ListChequeComponent } from '../../components/accounts/cheque/list-cheque/list-cheque.component';
import { PaymentVoucherComponent } from '../../shared/payment-voucher/payment-voucher.component';
import { ReceiptVoucherComponent } from '../../shared/receipt-voucher/receipt-voucher.component';
import { ManageVouchersComponent } from '../../components/vouchers/Common-vouchers/manage-vouchers/manage-vouchers.component';
import { ListDiscountLevelComponent } from '../../components/product master/discountLevel/list-discount-level/list-discount-level.component';
import { ListCustomerCategoryComponent } from '../../components/party/customer/customer-category/list-customer-category/list-customer-category.component';
import { ListSettlementComponent } from '../../components/reports/Settlement/list-settlement/list-settlement.component';
import { CommonPdfComponentComponent } from '../../shared/PDF/common-transaction/common-pdf-component/common-pdf-component.component';
import { ManageBankRecComponent } from '../../components/accounts/bankRec/manage-bank-rec/manage-bank-rec.component';
import { AllCentersAllProductsReportComponent } from '../../components/reports/stocks/all-centers-all-products-report/all-centers-all-products-report/all-centers-all-products-report.component';
import { VisitingCustomerListComponent } from '../../components/party/visitingCustomer/visiting-customer-list/visiting-customer-list.component';
import { ManageVisitingCustomerComponent } from '../../components/party/visitingCustomer/manage-visiting-customer/manage-visiting-customer.component';
import { ListCommissionlevelComponent } from '../../components/product master/CommissionLevel/list-commissionlevel/list-commissionlevel.component';
import { AllCentersOneProductReportComponent } from '../../components/reports/stocks/all-centers-one-product-report/all-centers-one-product-report/all-centers-one-product-report.component';
import { OneCenterOneProductReportComponent } from '../../components/reports/stocks/one-center-one-product-report/one-center-one-product-report/one-center-one-product-report.component';
import { ListCustomerTypeComponent } from '../../components/party/customer/customer-type/list-customer-type/list-customer-type.component';
import { ReportPdfComponent } from '../../shared/Report-Pdf/report-pdf/report-pdf.component';
import { DetailReportpdfComponent } from '../../shared/detail-report-pdf/detail-reportpdf/detail-reportpdf.component';
import { UserProfileComponent } from '../../components/dashboard/Profile/user-profile/user-profile.component';
import { OutstandingComponent } from '../../components/reports/outstanding/outstanding.component';
import { CostOfSalesReportComponent } from '../../components/vouchers/sales/Cost Of Sales/cost-of-sales-report/cost-of-sales-report.component';
import { ChequeinhandComponent } from '../../components/reports/chequeinhand/chequeinhand.component';
import { ProductPriceListComponent } from '../../components/reports/product-price-list/product-price-list.component';
import { PendingVouchersComponent } from '../../components/vouchers/pending-vouchers/pending-vouchers.component';
import { PartySettlementComponent } from '../../components/reports/party-settlement/party-settlement.component';
import { ApprovedVouchersComponent } from '../../components/vouchers/approved-vouchers/approved-vouchers.component';
import { MakeDepositComponent } from '../../components/accounts/make-deposit/make-deposit.component';
import { AdvancePaymentComponent } from '../../components/accounts/advance-payment/advance-payment.component';
import { TrialBalanceComponent } from '../../components/reports/trial-balance/trial-balance.component';
import { LedgerListingComponent } from '../../components/reports/ledger-listing/ledger-listing.component';
import { RejectInvoicesComponent } from '../../components/vouchers/reject-invoices/reject-invoices.component';
import { CommissionReportComponent } from '../../components/reports/commission-report/commission-report.component';
import { BankRecReportComponent } from '../../components/reports/bank-rec-report/bank-rec-report.component';
import { ProfitAndLostComponent } from '../../components/reports/profit-and-lost/profit-and-lost.component';
import { BalanceSheetComponent } from '../../components/reports/balance-sheet/balance-sheet.component';
import { DaybookComponent } from '../../components/accounts/daybook/daybook.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      { path: 'dash', component: DashComponent },

      { path: 'product', component: ProductListComponent },
      { path: 'brand', component: BrandListComponent },
      { path: 'type', component: TypeListComponent },
      { path: 'discountLevel', component: ListDiscountLevelComponent },
      { path: 'commissionLevel', component: ListCommissionlevelComponent },

      { path: 'customer', component: CustomerListComponent },
      { path: 'cutomer-category', component: ListCustomerCategoryComponent },
      { path: 'cutomer-type', component: ListCustomerTypeComponent },
      { path: 'supplier', component: SupplierListComponent },
      { path: 'center', component: CenterListComponent },

      { path: 'manage-GRN', component: ManageVouchersComponent },
      { path: 'purchase-order', component: ManageVouchersComponent },
      { path: 'stock-transfer', component: ManageVouchersComponent },
      { path: 'purchase-order-return', component: ManageVouchersComponent },
      { path: 'stock-verification', component: ManageVouchersComponent },

      { path: 'stock', component: StockListReportComponent },
      { path: 'transaction', component: TransactionComponent },
      { path: 'reject-invoices', component: RejectInvoicesComponent },
      { path: 'user', component: UserListComponent },
      { path: 'payment', component: ManagePaymentReceiptComponent },
      { path: 'receipt', component: ManagePaymentReceiptComponent },
      { path: 'directpayment', component: ManagePaymentReceiptComponent },
      { path: 'advancePayment', component: AdvancePaymentComponent },
      { path: 'create-utility', component: CreateUtilityBillComponent },
      { path: 'journal-entry', component: ManageJournalEntryComponent },
      { path: 'pay-utility', component: ManagePaymentReceiptComponent },
      { path: 'TotalReport', component: CombinedSalesReportComponent },
      { path: 'ProfitReport', component: ProfitReportComponent },
      { path: 'SalesmanReport', component: SalesmanReportComponent },
      { path: 'chartofAcc', component: ListChartofaccComponent },
      { path: 'accGroup', component: ListChartofaccComponent },
      { path: 'accCategory', component: ListChartofaccComponent },
      { path: 'petty-cash', component: ListPettyCashComponent },
      { path: 'supplier-enter-bill', component: SupplierEnterBillComponent },
      { path: 'cheque', component: ListChequeComponent },
      { path: 'PaymentVoucher', component: PaymentVoucherComponent },
      { path: 'ReceiptVoucher', component: ReceiptVoucherComponent },
      { path: 'settlement', component: ListSettlementComponent },
      { path: 'commontransactionpdf', component: CommonPdfComponentComponent },
      { path: 'bankReconciliation', component: ManageBankRecComponent },
      { path: 'allcentersproducts', component: AllCentersAllProductsReportComponent },
      { path: 'allcentersoneproducts', component: AllCentersOneProductReportComponent },
      { path: 'onecentersproducts', component: OneCenterOneProductReportComponent },
      { path: 'visitingCustomer', component: ManageVisitingCustomerComponent },
      { path: 'visitingCustomerlist', component: VisitingCustomerListComponent },
      { path: 'reportPdf', component: ReportPdfComponent },
      { path: 'detailreportPdf', component: DetailReportpdfComponent },
      { path: 'userprofile', component: UserProfileComponent },
      { path: 'customer-outstanding', component: OutstandingComponent },
      { path: 'supplier-outstanding', component: OutstandingComponent },
      { path: 'CostOfSales', component: CostOfSalesReportComponent },
      { path: 'chequeinhand', component: ChequeinhandComponent },
      { path: 'productDiscount', component: ProductPriceListComponent },
      { path: 'pending-transactions', component: PendingVouchersComponent },
      { path: 'approved-transactions', component: ApprovedVouchersComponent },
      { path: 'customer-settlement', component: PartySettlementComponent },
      { path: 'make-deposit', component: MakeDepositComponent },
      { path: 'trial-balance', component: TrialBalanceComponent },
      { path: 'ledger-listing', component: LedgerListingComponent },
      { path: 'commission-report', component: CommissionReportComponent },
      { path: 'bankRec-Report', component: BankRecReportComponent },
      { path: 'profit-and-lost', component: ProfitAndLostComponent },
      { path: 'balance-sheet', component: BalanceSheetComponent },
       { path: 'DayBook', component: DaybookComponent },
      { path: '', redirectTo: 'dash', pathMatch: 'full' },

    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
