import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from './http.service';
import { DashboardAlerts, InventoryValuation, DashboardStats, LowStockAlert, RecentMovement } from '../models/models';

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    constructor(private http: HttpService) { }

    getAlerts(): Observable<DashboardAlerts> {
        return this.http.get<DashboardAlerts>('/dashboard/alerts');
    }

    getValuation(): Observable<InventoryValuation> {
        return this.http.get<InventoryValuation>('/dashboard/valuation');
    }

    getStats(): Observable<DashboardStats> {
        return this.http.get<DashboardStats>('/dashboard/stats');
    }

    getLowStock(threshold: number = 50): Observable<LowStockAlert[]> {
        return this.http.get<LowStockAlert[]>(`/dashboard/low-stock?threshold=${threshold}`);
    }

    getRecentMovements(count: number = 15): Observable<RecentMovement[]> {
        return this.http.get<RecentMovement[]>(`/dashboard/recent-movements?count=${count}`);
    }
}
