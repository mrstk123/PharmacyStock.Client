import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DashboardAlerts, InventoryValuation, DashboardStats, LowStockAlert, RecentMovement } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private apiUrl = `${environment.apiUrl}/dashboard`;

    constructor(private http: HttpClient) { }

    getAlerts(): Observable<DashboardAlerts> {
        return this.http.get<DashboardAlerts>(`${this.apiUrl}/alerts`);
    }

    getValuation(): Observable<InventoryValuation> {
        return this.http.get<InventoryValuation>(`${this.apiUrl}/valuation`);
    }

    getStats(): Observable<DashboardStats> {
        return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
    }

    getLowStock(threshold: number = 50): Observable<LowStockAlert[]> {
        return this.http.get<LowStockAlert[]>(`${this.apiUrl}/low-stock?threshold=${threshold}`);
    }

    getRecentMovements(count: number = 15): Observable<RecentMovement[]> {
        return this.http.get<RecentMovement[]>(`${this.apiUrl}/recent-movements?count=${count}`);
    }
}
