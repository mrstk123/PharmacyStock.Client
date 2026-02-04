import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { HttpService } from './http.service';
import { StockMovementDto } from '../models/models';

@Injectable({
    providedIn: 'root'
})
export class StockMovementService {
    constructor(private http: HttpService) { }

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

        return this.http.get<StockMovementDto[]>('/stockmovements/movements', params);
    }
}
