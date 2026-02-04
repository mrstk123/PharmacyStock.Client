import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { HttpService } from './http.service';
import { Medicine, CreateMedicine, UpdateMedicine, PaginatedResult } from '../models/models';

@Injectable({
    providedIn: 'root'
})
export class MedicineService {
    private readonly ENDPOINT = '/medicines';

    constructor(private http: HttpService) { }

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

        return this.http.get<PaginatedResult<Medicine>>(this.ENDPOINT, params);
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

        return this.http.get<Medicine[]>(`${this.ENDPOINT}/search`, params);
    }

    getMedicineById(id: number): Observable<Medicine> {
        return this.http.get<Medicine>(`${this.ENDPOINT}/${id}`);
    }

    createMedicine(medicine: CreateMedicine): Observable<Medicine> {
        return this.http.post<Medicine>(this.ENDPOINT, medicine);
    }

    updateMedicine(id: number, medicine: UpdateMedicine): Observable<void> {
        return this.http.put<void>(`${this.ENDPOINT}/${id}`, medicine);
    }

    deleteMedicine(id: number): Observable<void> {
        return this.http.delete<void>(`${this.ENDPOINT}/${id}`);
    }
}
