import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams, HttpClient } from '@angular/common/http';
import { Medicine, CreateMedicine, UpdateMedicine, PaginatedResult } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class MedicineService {
    private apiUrl = `${environment.apiUrl}/medicines`;

    constructor(private http: HttpClient) { }

    getMedicines(page: number = 1, pageSize: number = 10, status?: boolean, sortField?: string, sortOrder?: number): Observable<PaginatedResult<Medicine>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('pageSize', pageSize.toString());

        if (status !== undefined) {
            params = params.set('isActive', status.toString());
        }

        if (sortField) {
            params = params.set('sortField', sortField);
        }

        if (sortOrder !== undefined) {
            params = params.set('sortOrder', sortOrder.toString());
        }

        return this.http.get<PaginatedResult<Medicine>>(this.apiUrl, { params });
    }

    searchMedicines(query: string, status?: boolean, sortField?: string, sortOrder?: number): Observable<Medicine[]> {
        let params = new HttpParams().set('q', query);
        if (status !== undefined && status !== null) {
            params = params.set('isActive', status.toString());
        }

        if (sortField) {
            params = params.set('sortField', sortField);
        }

        if (sortOrder !== undefined) {
            params = params.set('sortOrder', sortOrder.toString());
        }

        return this.http.get<Medicine[]>(`${this.apiUrl}/search`, { params });
    }

    getMedicineById(id: number): Observable<Medicine> {
        return this.http.get<Medicine>(`${this.apiUrl}/${id}`);
    }

    createMedicine(medicine: CreateMedicine): Observable<Medicine> {
        return this.http.post<Medicine>(this.apiUrl, medicine);
    }

    updateMedicine(id: number, medicine: UpdateMedicine): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}`, medicine);
    }

    deleteMedicine(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
