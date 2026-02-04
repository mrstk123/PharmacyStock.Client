import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, merge } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { DashboardStats } from '../../../models/models';
import { DashboardService } from '../../../service/dashboard.service';
import { WebSocketService } from '../../../service/websocket.service';

@Component({
    standalone: true,
    selector: 'app-stats-widget',
    imports: [CommonModule],
    template: `<div class="col-span-12 lg:col-span-6 xl:col-span-3" *ngIf="stats$ | async as stats">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Total Active Medicines</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ stats.totalMedicines }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-box text-blue-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">{{ stats.lowStockItems }} </span>
                <span class="text-muted-color">low stock items</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3" *ngIf="stats$ | async as stats">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Inventory Value</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ stats.totalInventoryValue | currency }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-dollar text-orange-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">{{ stats.activeBatches }} </span>
                <span class="text-muted-color">active batches</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3" *ngIf="stats$ | async as stats">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Critical Alerts</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ stats.criticalAlerts }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-red-100 dark:bg-red-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-exclamation-circle text-red-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">Action Required </span>
                <span class="text-muted-color">immediately</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3" *ngIf="stats$ | async as stats">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Warnings</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ stats.warningAlerts }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-yellow-100 dark:bg-yellow-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-exclamation-triangle text-yellow-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">Expiring </span>
                <span class="text-muted-color">soon</span>
            </div>
        </div>`
})
export class StatsWidget {
    stats$: Observable<DashboardStats>;

    initialStats: DashboardStats = {
        totalMedicines: 0,
        totalInventoryValue: 0,
        criticalAlerts: 0,
        warningAlerts: 0,
        activeBatches: 0,
        lowStockItems: 0
    };

    constructor(
        private dashboardService: DashboardService,
        private webSocketService: WebSocketService
    ) {
        // Merge initial load with real-time updates
        this.stats$ = merge(
            this.dashboardService.getStats(),
            this.webSocketService.statsUpdate$
        ).pipe(
            startWith(this.initialStats)
        );
    }
}
