import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { CommonModule } from '@angular/common';
import { Observable, Subject, merge } from 'rxjs';
import { startWith, switchMap, map } from 'rxjs/operators';
import { DashboardAlerts, AlertItem, Notification } from '../../../models/models';
import { NotificationService } from '../../../service/notification.service';
import { WebSocketService } from '../../../service/websocket.service';

@Component({
    standalone: true,
    selector: 'app-notifications-widget',
    imports: [ButtonModule, MenuModule, CommonModule],
    template: `<div class="card" *ngIf="alerts$ | async as alerts">
        <div class="flex items-center justify-between mb-6">
            <div class="font-semibold text-xl">Alerts & Notifications</div>
            <div>
                <button pButton type="button" icon="pi pi-ellipsis-v" class="p-button-rounded p-button-text p-button-plain" (click)="menu.toggle($event)"></button>
                <p-menu #menu [popup]="true" [model]="items"></p-menu>
            </div>
        </div>

        <span class="block text-muted-color font-medium mb-4" *ngIf="alerts.critical.length > 0">CRITICAL ({{alerts.critical.length}})</span>
        <ul class="p-0 mx-0 mt-0 mb-6 list-none" *ngIf="alerts.critical.length > 0">
            <li class="flex items-center py-2 border-b border-surface" *ngFor="let item of alerts.critical">
                <div class="w-12 h-12 flex items-center justify-center bg-red-100 dark:bg-red-400/10 rounded-full mr-4 shrink-0">
                    <i class="pi pi-exclamation-circle text-xl! text-red-500"></i>
                </div>
                <span class="text-surface-900 dark:text-surface-0 leading-normal">{{ item.message }}</span>
            </li>
        </ul>

        <span class="block text-muted-color font-medium mb-4" *ngIf="alerts.warning.length > 0">WARNING ({{alerts.warning.length}})</span>
        <ul class="p-0 m-0 list-none mb-6" *ngIf="alerts.warning.length > 0">
            <li class="flex items-center py-2 border-b border-surface" *ngFor="let item of alerts.warning">
                <div class="w-12 h-12 flex items-center justify-center bg-yellow-100 dark:bg-yellow-400/10 rounded-full mr-4 shrink-0">
                    <i class="pi pi-exclamation-triangle text-xl! text-yellow-500"></i>
                </div>
                <span class="text-surface-900 dark:text-surface-0 leading-normal">{{ item.message }}</span>
            </li>
        </ul>
        
        <div *ngIf="alerts.critical.length === 0 && alerts.warning.length === 0" class="text-center p-4">
            <i class="pi pi-check-circle text-4xl text-green-500 mb-2"></i>
            <p class="text-surface-600 dark:text-surface-200">No active alerts. Inventory is healthy.</p>
        </div>
    </div>`
})
export class NotificationsWidget {
    items = [
        { label: 'Refresh', icon: 'pi pi-fw pi-refresh', command: () => this.refresh$.next() }
    ];

    alerts$: Observable<DashboardAlerts>;
    refresh$ = new Subject<void>();

    initialAlerts: DashboardAlerts = {
        critical: [],
        warning: []
    };

    constructor(
        private notificationService: NotificationService,
        private webSocketService: WebSocketService
    ) {
        // Stream 1: Initial load from system alerts
        const initialLoad$ = this.notificationService.getSystemAlerts().pipe(
            map(notifications => this.convertToAlerts(notifications))
        );

        // Stream 2: Manual refresh
        const manualRefresh$ = this.refresh$.pipe(
            switchMap(() => this.notificationService.getSystemAlerts()),
            map(notifications => this.convertToAlerts(notifications))
        );

        // Stream 3: Real-time updates (still using WebSocket for now)
        const socketUpdates$ = this.webSocketService.alertsUpdate$;

        this.alerts$ = merge(initialLoad$, manualRefresh$, socketUpdates$).pipe(
            startWith(this.initialAlerts)
        );
    }

    private convertToAlerts(notifications: Notification[]): DashboardAlerts {
        const alerts: DashboardAlerts = { critical: [], warning: [] };

        notifications.forEach(n => {
            const alertItem: AlertItem = {
                medicineId: n.relatedEntityId || 0,
                medicineName: '',
                batchNumber: '',
                expiryDate: new Date().toISOString().split('T')[0] as any,
                daysRemaining: 0,
                currentQuantity: 0,
                message: n.message
            };

            if (n.type === 2) { // Critical
                alerts.critical.push(alertItem);
            } else if (n.type === 1) { // Warning
                alerts.warning.push(alertItem);
            }
        });

        return alerts;
    }
}
