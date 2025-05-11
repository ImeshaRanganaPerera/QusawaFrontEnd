import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ManageSalesComponent } from './components/vouchers/sales/manage-sales/manage-sales.component';
import { DownloadPdfComponent } from './shared/download-pdf/download-pdf.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'sales', component: ManageSalesComponent },
    { path: 'salesOrder', component: ManageSalesComponent },
    { path: 'salesReturn', component: ManageSalesComponent },
    { path: 'download', component: DownloadPdfComponent },
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    {
        path: 'dashboard',
        loadChildren: () =>
            import('./modules/dashboard/dashboard.module').then(
                (m) => m.DashboardModule
            ),
    },
];
