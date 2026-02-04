import { Routes } from '@angular/router';
import { AppLayout } from './layout/component/app.layout';
import { Dashboard } from './pages/dashboard/dashboard';
import { MedicinesList } from './pages/medicines/medicines-list';
import { MedicineForm } from './pages/medicines/medicine-form';
import { SuppliersList } from './pages/suppliers/suppliers-list';
import { SupplierForm } from './pages/suppliers/supplier-form';
import { Login } from './pages/auth/login/login';
import { ForgotPassword } from './pages/auth/forgot-password/forgot-password';
import { ResetPassword } from './pages/auth/reset-password/reset-password';
import { ReceiveStock } from './pages/inventory/receive-stock/receive-stock';
import { StockList } from './pages/inventory/stock-list/stock-list';
import { DispenseStock } from './pages/inventory/dispense-stock/dispense-stock';
import { StockAdjustment } from './pages/inventory/stock-adjustment/stock-adjustment';
import { StockHistory } from './pages/inventory/stock-history/stock-history';
import { ExpiryManagement } from './pages/inventory/expiry-management/expiry-management';
import { RolePermissions } from './pages/settings/role-permissions/role-permissions';
import { RoleList } from './pages/settings/role-list/role-list';
import { ExpiryRuleList } from './pages/settings/expiry-rule-list/expiry-rule-list';
import { UserList } from './pages/settings/user-list/user-list';
import { ChangePassword } from './pages/auth/change-password/change-password';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: 'login',
        component: Login
    },
    {
        path: 'forgot-password',
        component: ForgotPassword
    },
    {
        path: 'reset-password',
        component: ResetPassword
    },
    {
        path: '',
        component: AppLayout,
        canActivate: [authGuard],
        runGuardsAndResolvers: 'always',
        children: [
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            },
            {
                path: 'dashboard',
                component: Dashboard
            },
            {
                path: 'medicines',
                component: MedicinesList
            },
            {
                path: 'medicines/new',
                component: MedicineForm
            },
            {
                path: 'medicines/edit/:id',
                component: MedicineForm
            },
            {
                path: 'suppliers',
                component: SuppliersList
            },
            {
                path: 'suppliers/new',
                component: SupplierForm
            },
            {
                path: 'suppliers/edit/:id',
                component: SupplierForm
            },
            {
                path: 'inventory/receive',
                component: ReceiveStock
            },
            {
                path: 'inventory',
                component: StockList
            },
            {
                path: 'inventory/dispense',
                component: DispenseStock
            },
            {
                path: 'inventory/adjust',
                component: StockAdjustment
            },
            {
                path: 'inventory/history',
                component: StockHistory
            },
            {
                path: 'inventory/expiry-management',
                component: ExpiryManagement
            },
            {
                path: 'settings/roles',
                component: RoleList
            },
            {
                path: 'settings/role-permissions',
                component: RolePermissions
            },
            {
                path: 'settings/expiry-rules',
                component: ExpiryRuleList
            },
            {
                path: 'settings/users',
                component: UserList
            },
            {
                path: 'auth/change-password',
                component: ChangePassword
            }
        ]
    },
    {
        path: '**',
        redirectTo: 'dashboard'
    }
];
