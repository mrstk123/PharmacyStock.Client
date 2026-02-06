import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams, HttpClient } from '@angular/common/http';
import { StockMovementDto } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class StockMovementService {
    private apiUrl = `${environment.apiUrl}/stockmovements`;

    constructor(private http: HttpClient) { }

    getMovements(startDate?: Date, endDate?: Date, type?: string): Observable<StockMovementDto[]> {
        let params = new HttpParams();

        if (startDate) {
            params = params.set('startDate', startDate.toISOString());
        }
        if (endDate) {
            params = params.set('endDate', endDate.toISOString());
        }
        if (type) {
            params = params.set('movementType', type);
        }

        return this.http.get<StockMovementDto[]>(`${this.apiUrl}/movements`, { params });
    }
}
