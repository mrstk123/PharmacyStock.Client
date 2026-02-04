import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Supplier, CreateSupplier, UpdateSupplier } from '../models/models';

@Injectable({
    providedIn: 'root'
})
export class SupplierService {
    private apiUrl = `${environment.apiUrl}/suppliers`;

    constructor(private http: HttpClient) { }

    getSuppliers(status?: boolean): Observable<Supplier[]> {
        let params = new HttpParams();
        if (status !== undefined && status !== null) {
            params = params.set('isActive', status.toString());
        }
        return this.http.get<Supplier[]>(this.apiUrl, { params });
    }

    getSupplierById(id: number): Observable<Supplier> {
        return this.http.get<Supplier>(`${this.apiUrl}/${id}`);
    }

    createSupplier(supplier: CreateSupplier): Observable<Supplier> {
        return this.http.post<Supplier>(this.apiUrl, supplier);
    }

    updateSupplier(id: number, supplier: UpdateSupplier): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}`, supplier);
    }

    deleteSupplier(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
