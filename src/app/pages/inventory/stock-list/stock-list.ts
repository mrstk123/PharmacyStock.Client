import { Component, OnInit, signal, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectItem } from 'primeng/api';
import { InventoryService } from '../../../service/inventory.service';
import { MedicineBatch, BatchStatus, UpdateMedicineBatch } from '../../../models/models';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

@Component({
    selector: 'app-stock-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        TagModule,
        IconFieldModule,
        InputIconModule,
        TooltipModule,
        SelectModule,
        SelectModule,
        DatePickerModule,
        DialogModule,
        InputNumberModule,
        ToastModule,
        ConfirmDialogModule
    ],
    providers: [MessageService, ConfirmationService, DatePipe],
    templateUrl: './stock-list.html',
    styles: [`
        :host ::ng-deep .p-datatable-header {
            border-top: none;
        }
    `]
})
export class StockList implements OnInit {
    private originalBatches: MedicineBatch[] = [];
    batches = signal<MedicineBatch[]>([]);
    loading = signal<boolean>(true);

    // Filters
    selectedMedicine: MedicineBatch | null = null;
    rangeDates: Date[] | undefined;
    selectedStatus: BatchStatus | null = null;

    medicineOptions: MedicineBatch[] = [];
    statusOptions: SelectItem[] = [
        { label: 'Active', value: BatchStatus.Active },
        { label: 'Quarantined', value: BatchStatus.Quarantined },
        { label: 'Expired', value: BatchStatus.Expired },
        { label: 'Depleted', value: BatchStatus.Depleted },
        { label: 'Closed', value: BatchStatus.Closed }
    ];



    // Edit Dialog
    editDialogVisible = false;
    selectedBatch: MedicineBatch | null = null;
    editExpiryDate: Date | null = null;
    editPurchasePrice: number = 0;
    editSellingPrice: number = 0;
    saving = signal<boolean>(false);
    private destroyRef = inject(DestroyRef);

    constructor(
        private inventoryService: InventoryService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private datePipe: DatePipe,
        private errorHandler: ErrorHandlerService
    ) { }

    ngOnInit() {
        this.loadBatches();
    }

    loadBatches() {
        this.loading.set(true);
        this.inventoryService.getBatches().pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe({
            next: (data) => {
                this.originalBatches = data;
                this.batches.set(data);
                this.populateMedicineOptions();
                this.loading.set(false);
            },
            error: (err) => {
                this.errorHandler.handleError(err, 'Failed to load batches');
                this.loading.set(false);
            }
        });
    }

    populateMedicineOptions() {
        // Extract unique medicines from batches for the filter dropdown
        const uniqueMedicines = new Map<string, MedicineBatch>();
        this.originalBatches.forEach(b => {
            if (!uniqueMedicines.has(b.medicineName)) {
                uniqueMedicines.set(b.medicineName, b);
            }
        });

        // Sort alphabetically
        this.medicineOptions = Array.from(uniqueMedicines.values())
            .sort((a, b) => a.medicineName.localeCompare(b.medicineName));
    }

    applyFilters() {
        let filtered = [...this.originalBatches];

        // 1. Filter by Medicine
        if (this.selectedMedicine) {
            filtered = filtered.filter(b => b.medicineName === this.selectedMedicine?.medicineName);
        }

        // 2. Filter by Status
        if (this.selectedStatus !== null) {
            filtered = filtered.filter(b => b.status === this.selectedStatus);
        }

        // 3. Filter by Expiry Date Range
        if (this.rangeDates && this.rangeDates.length === 2 && this.rangeDates[0] && this.rangeDates[1]) {
            const startDate = this.rangeDates[0];
            const endDate = this.rangeDates[1];
            // Set end date to end of day to include the full day
            endDate.setHours(23, 59, 59, 999);

            filtered = filtered.filter(b => {
                const expiry = new Date(b.expiryDate);
                return expiry >= startDate && expiry <= endDate;
            });
        }

        this.batches.set(filtered);
    }

    clearFilters() {
        this.selectedMedicine = null;
        this.selectedStatus = null;
        this.rangeDates = undefined;
        this.batches.set(this.originalBatches);
    }

    getSeverity(status: BatchStatus) {
        return this.inventoryService.getStatusSeverity(status);
    }

    getStatusLabel(status: BatchStatus) {
        return this.inventoryService.getStatusLabel(status);
    }

    openEditDialog(batch: MedicineBatch) {
        this.selectedBatch = batch;
        this.editExpiryDate = new Date(batch.expiryDate);
        this.editPurchasePrice = batch.purchasePrice;
        this.editSellingPrice = batch.sellingPrice;
        this.editDialogVisible = true;
    }

    hideDialog() {
        this.editDialogVisible = false;
        this.selectedBatch = null;
    }

    saveBatch() {
        if (!this.selectedBatch || !this.editExpiryDate) return;

        this.saving.set(true);

        const updateDto: UpdateMedicineBatch = {
            id: this.selectedBatch.id,
            batchNumber: this.selectedBatch.batchNumber,
            expiryDate: this.datePipe.transform(this.editExpiryDate, 'yyyy-MM-dd')!,
            status: this.selectedBatch.status,
            isActive: this.selectedBatch.isActive,
            purchasePrice: this.editPurchasePrice,
            sellingPrice: this.editSellingPrice
        };

        this.inventoryService.updateBatch(this.selectedBatch.id, updateDto).pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Batch updated' });
                this.loadBatches(); // Reload to refresh data
                this.hideDialog();
                this.saving.set(false);
            },
            error: (err) => {
                this.errorHandler.handleError(err, 'Failed to update batch');
                this.saving.set(false);
            }
        });
    }

    // isExpiringSoon(expiryDate: string): boolean {
    //     const today = new Date();
    //     const expiry = new Date(expiryDate);
    //     const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));
    //     return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    // }
}
