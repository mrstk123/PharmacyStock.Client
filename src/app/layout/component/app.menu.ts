import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppMenuitem } from './app.menuitem';
import { MenuItem } from 'primeng/api';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})
export class AppMenu implements OnInit {
    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            {
                label: 'Home',
                items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/dashboard'] }]
            },
            {
                label: 'Master Data',
                items: [
                    { label: 'Medicines', icon: 'pi pi-fw pi-box', routerLink: ['/medicines'] },
                    { label: 'Suppliers', icon: 'pi pi-fw pi-truck', routerLink: ['/suppliers'] }
                ]
            },
            {
                label: 'Inventory',
                items: [
                    { label: 'Stock List', icon: 'pi pi-fw pi-list', routerLink: ['/inventory'] },
                    { label: 'Receive Stock', icon: 'pi pi-fw pi-plus-circle', routerLink: ['/inventory/receive'] },
                    { label: 'Dispense Stock', icon: 'pi pi-fw pi-minus-circle', routerLink: ['/inventory/dispense'] },
                    { label: 'Stock Adjustment', icon: 'pi pi-fw pi-cog', routerLink: ['/inventory/adjust'] },
                    { label: 'Stock History', icon: 'pi pi-fw pi-history', routerLink: ['/inventory/history'] },
                    { label: 'Expiry Management', icon: 'pi pi-fw pi-exclamation-triangle', routerLink: ['/inventory/expiry-management'] }
                ]
            },
            {
                label: 'Settings',
                items: [
                    { label: 'Users', icon: 'pi pi-fw pi-users', routerLink: ['/settings/users'] },
                    { label: 'Role Permissions', icon: 'pi pi-fw pi-lock', routerLink: ['/settings/roles'] },
                    { label: 'Expiry Rules', icon: 'pi pi-fw pi-clock', routerLink: ['/settings/expiry-rules'] }
                ]
            }
        ];
    }
}