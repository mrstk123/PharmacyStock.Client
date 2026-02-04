import { Component } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { CommonModule } from '@angular/common';
import { Observable, merge } from 'rxjs';
import { map, scan, startWith } from 'rxjs/operators';
import { RecentMovement } from '../../../models/models';
import { DashboardService } from '../../../service/dashboard.service';
import { WebSocketService } from '../../../service/websocket.service';

@Component({
    standalone: true,
    selector: 'app-recent-movements-widget',
    imports: [CommonModule, TableModule, ButtonModule, RippleModule],
    template: `<div class="card mb-8!" *ngIf="movements$ | async as movements">
        <div class="font-semibold text-xl mb-4">Recent Stock Movements</div>
        <p-table [value]="movements" responsiveLayout="scroll">
            <ng-template #header>
                <tr>
                    <th>Medicine</th>
                    <th>Type</th>
                    <th>Qty</th>
                    <th>Performed By</th>
                    <th>Date</th>
                </tr>
            </ng-template>
            <ng-template #body let-movement>
                <tr>
                    <td style="width: 30%;">
                        <span class="block text-900 font-medium">{{ movement.medicineName }}</span>
                        <span class="block text-500">{{ movement.batchNumber }}</span>
                    </td>
                    <td style="width: 20%;">
                        <span [class]="'product-badge status-' + (movement.movementType.includes('IN') ? 'instock' : 'lowstock')">
                            {{ movement.movementType.replace('IN_', '').replace('OUT_', '') }}
                        </span>
                    </td>
                    <td style="width: 15%; font-weight: bold">{{ movement.quantity }}</td>
                    <td style="width: 20%;">{{ movement.performedBy }}</td>
                    <td style="width: 15%;">{{ movement.performedAt | date:'short' }}</td>
                </tr>
            </ng-template>
        </p-table>
    </div>`
})
export class RecentMovementsWidget {
    movements$: Observable<RecentMovement[]>;

    constructor(
        private dashboardService: DashboardService,
        private webSocketService: WebSocketService
    ) {
        // Initial load
        const initialLoad$ = this.dashboardService.getRecentMovements(5);

        // Real-time updates: Accumulate new movements
        const socketUpdates$ = this.webSocketService.movementAdded$;

        // Combine initial load with subsequent single items
        this.movements$ = merge(
            initialLoad$,
            socketUpdates$.pipe(
                map(movement => [movement]) // Wrap single movement in array to match type for scan
            )
        ).pipe(
            scan((acc: RecentMovement[], curr: RecentMovement[]) => {
                // If curr is a list (from initial load), replace accumulator
                if (curr.length > 1) return curr;

                // If curr is single item (wrapped in array), prepend to accumulator
                return [...curr, ...acc].slice(0, 5);
            }, []),
            startWith([])
        );
    }
}
