import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from './http.service';
import {
    StockCheck,
    MedicineBatch,
    CreateMedicineBatch,
    UpdateMedicineBatch,
    StockMovementDto,
    ExpiryManagementDto,
    DispensePreview,
    DispenseResult,
    AlternativeMedicineDto
} from '../models/models';
import { HttpParams } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class InventoryService {
    constructor(private http: HttpService) { }

    // Stock Check
    getStockCheck(medicineId: number): Observable<StockCheck> {
        return this.http.get<StockCheck>(`/inventory/stock-check/${medicineId}`);
    }

    checkBatchExists(medicineId: number, batchNumber: string): Observable<MedicineBatch> {
        return this.http.get<MedicineBatch>(`/inventory/check-batch?medicineId=${medicineId}&batchNumber=${batchNumber}`);
    }

    // Batches
    getBatches(): Observable<MedicineBatch[]> {
        return this.http.get<MedicineBatch[]>('/inventory/batches');
    }

    getBatchById(id: number): Observable<MedicineBatch> {
        return this.http.get<MedicineBatch>(`/inventory/batches/${id}`);
    }

    createBatch(batch: CreateMedicineBatch): Observable<MedicineBatch> {
        return this.http.post<MedicineBatch>('/inventory/batches', batch);
    }

    updateBatch(id: number, batch: UpdateMedicineBatch): Observable<void> {
        return this.http.put<void>(`/inventory/batches/${id}`, batch);
    }

    deleteBatch(id: number): Observable<void> {
        return this.http.delete<void>(`/inventory/batches/${id}`);
    }

    previewDispense(medicineId: number, quantity: number): Observable<DispensePreview> {
        return this.http.post<DispensePreview>('/inventory/dispense/preview', { medicineId, quantity });
    }

    dispenseStock(dto: { medicineId: number, quantity: number, reason?: string }): Observable<DispenseResult> {
        return this.http.post<DispenseResult>('/inventory/dispense', dto);
    }

    adjustStock(dto: { batchId: number, newQuantity: number, reason: string }): Observable<any> {
        return this.http.post<any>('/inventory/adjust', dto);
    }

    getStockMovements(fromDate?: string, toDate?: string, medicineId?: number, movementType?: string): Observable<StockMovementDto[]> {
        let params = new HttpParams();

        if (fromDate) params = params.set('fromDate', fromDate);
        if (toDate) params = params.set('toDate', toDate);
        if (medicineId) params = params.set('medicineId', medicineId.toString());
        if (movementType) params = params.set('movementType', movementType);

        return this.http.get<StockMovementDto[]>('/inventory/movements', params);
    }

    getExpiryManagement(status?: string): Observable<ExpiryManagementDto[]> {
        let params = new HttpParams();
        if (status) params = params.set('status', status);

        return this.http.get<ExpiryManagementDto[]>('/inventory/expiry-management', params);
    }

    quarantineBatch(batchId: number, quarantine: boolean): Observable<any> {
        // Send raw boolean value as JSON body for ASP.NET Core [FromBody] binding
        return this.http.patch<any>(`/inventory/batches/${batchId}/quarantine`, quarantine);
    }

    disposeExpiredStock(batchId: number, quantity: number, reason: string): Observable<any> {
        const dto = { batchId, quantity, reason };
        return this.http.post<any>('/StockOperations/remove-expired', dto);
    }

    returnToSupplier(batchId: number, reason: string): Observable<any> {
        const dto = { batchId, reason };
        return this.http.post<any>('/StockOperations/return-to-supplier', dto);
    }

    getAlternatives(medicineId: number): Observable<AlternativeMedicineDto[]> {
        return this.http.get<AlternativeMedicineDto[]>(`/inventory/alternatives/${medicineId}`);
    }

    // Helper function to get human-readable status label
    getStatusLabel(status: number): string {
        switch (status) {
            case 0: return 'Active';
            case 1: return 'Quarantined';
            case 2: return 'Expired';
            case 3: return 'Depleted';
            case 4: return 'Closed';
            default: return 'Unknown';
        }
    }

    // Helper function to get status badge severity for PrimeNG
    getStatusSeverity(status: number): 'success' | 'warn' | 'danger' | 'secondary' {
        switch (status) {
            case 0: return 'success';    // Active - green
            case 1: return 'warn';       // Quarantined - yellow
            case 2: return 'danger';     // Expired - red
            case 3: return 'secondary';  // Depleted - gray
            case 4: return 'secondary';  // Closed - gray
            default: return 'secondary';
        }
    }
}
