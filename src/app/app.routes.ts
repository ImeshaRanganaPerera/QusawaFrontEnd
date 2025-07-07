import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ManageSalesComponent } from './components/vouchers/sales/manage-sales/manage-sales.component';
import { DownloadPdfComponent } from './shared/download-pdf/download-pdf.component';
import { ProfitAndLostComponent } from './components/reports/profit-and-lost/profit-and-lost.component';
import { ManageVouchersComponent } from './components/vouchers/Common-vouchers/manage-vouchers/manage-vouchers.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'sales', component: ManageSalesComponent },
    { path: 'salesOrder', component: ManageSalesComponent },
    { path: 'salesReturn', component: ManageSalesComponent },
    { path: 'manage-GRN', component: ManageVouchersComponent },
    { path: 'download', component: DownloadPdfComponent },
     { path: 'profit-lost', component: ProfitAndLostComponent },
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    {
        path: 'dashboard',
        loadChildren: () =>
            import('./modules/dashboard/dashboard.module').then(
                (m) => m.DashboardModule
            ),
    },
];
