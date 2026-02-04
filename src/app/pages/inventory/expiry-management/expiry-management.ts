import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { InventoryService } from '../../../service/inventory.service';
import { ExpiryManagementDto } from '../../../models/models';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
    selector: 'app-expiry-management',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        TabsModule,
        ButtonModule,
        CardModule,
        TagModule,
        ToastModule,
        TabsModule,
        ConfirmDialogModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './expiry-management.html'
})
export class ExpiryManagement implements OnInit {
    expiredBatches: WritableSignal<ExpiryManagementDto[]> = signal([]);
    expiringSoonBatches: WritableSignal<ExpiryManagementDto[]> = signal([]);
    allBatches: WritableSignal<ExpiryManagementDto[]> = signal([]);

    loadingExpired: boolean = false;
    loadingExpiringSoon: boolean = false;
    loadingAll: boolean = false;

    Math = Math; // Expose Math to template

    constructor(
        private inventoryService: InventoryService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) { }

    ngOnInit() {
        this.loadExpiredBatches();
        this.loadExpiringSoonBatches();
        this.loadAllBatches();
    }

    loadExpiredBatches() {
        this.loadingExpired = true;
        this.inventoryService.getExpiryManagement('expired').subscribe({
            next: (data) => {
                this.expiredBatches.set(data);
                this.loadingExpired = false;
            },
            error: (err) => {
                console.error('Failed to load expired batches', err);
                this.loadingExpired = false;
            }
        });
    }

    loadExpiringSoonBatches() {
        this.loadingExpiringSoon = true;
        this.inventoryService.getExpiryManagement('expiring-soon').subscribe({
            next: (data) => {
                this.expiringSoonBatches.set(data);
                this.loadingExpiringSoon = false;
            },
            error: (err) => {
                console.error('Failed to load expiring soon batches', err);
                this.loadingExpiringSoon = false;
            }
        });
    }

    loadAllBatches() {
        this.loadingAll = true;
        // Load only "in-date" batches (Normal urgency - not expired, not expiring soon)
        this.inventoryService.getExpiryManagement('in-date').subscribe({
            next: (data) => {
                this.allBatches.set(data);
                this.loadingAll = false;
            },
            error: (err) => {
                console.error('Failed to load in-date batches', err);
                this.loadingAll = false;
            }
        });
    }

    getSeverity(status: string): 'success' | 'danger' | 'info' | 'warn' | 'secondary' | 'contrast' {
        switch (status) {
            case 'Expired': return 'danger';
            case 'Critical': return 'danger';
            case 'Warning': return 'warn';
            case 'Normal': return 'success';
            case 'N/A': return 'secondary'; // Expired batches - urgency not applicable
            default: return 'secondary';
        }
    }

    disposeStock(batch: ExpiryManagementDto) {
        this.confirmationService.confirm({
            message: `Dispose batch ${batch.batchNumber} (${batch.medicineName})? This will remove the stock from inventory.`,
            header: 'Confirm Disposal',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            rejectButtonStyleClass: 'p-button-text',
            accept: () => {
                this.inventoryService.disposeExpiredStock(batch.id, batch.currentQuantity, 'Disposal')
                    .subscribe({
                        next: () => {
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Stock Disposed',
                                detail: `Batch ${batch.batchNumber} has been disposed successfully`
                            });
                            // Reload all tabs to reflect the status change
                            this.loadExpiredBatches();
                            this.loadExpiringSoonBatches();
                            this.loadAllBatches();
                        },
                        error: (error) => {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Disposal Failed',
                                detail: error.error?.message || 'Failed to dispose stock'
                            });
                        }
                    });
            }
        });
    }

    returnToSupplier(batch: ExpiryManagementDto) {
        this.confirmationService.confirm({
            message: `Return entire batch ${batch.batchNumber} (${batch.medicineName})? This will remove the stock from inventory`,
            header: 'Confirm Return to Supplier',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-warning',
            rejectButtonStyleClass: 'p-button-text',
            accept: () => {
                this.inventoryService.returnToSupplier(batch.id, 'Return')
                    .subscribe({
                        next: () => {
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Returned to Supplier',
                                detail: `Batch ${batch.batchNumber} has been returned successfully`
                            });
                            // Reload all tabs
                            this.loadExpiredBatches();
                            this.loadExpiringSoonBatches();
                            this.loadAllBatches();
                        },
                        error: (error) => {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Return Failed',
                                detail: error.error?.message || 'Failed to return stock to supplier'
                            });
                        }
                    });
            }
        });
    }

    applyDiscount(batch: ExpiryManagementDto) {
        this.messageService.add({
            severity: 'info',
            summary: 'Apply Discount',
            detail: `Discount action for batch ${batch.batchNumber} will be implemented`
        });
    }

    quarantineBatch(batch: ExpiryManagementDto, quarantine: boolean) {
        const action = quarantine ? 'quarantine' : 'activate';
        const actionPast = quarantine ? 'quarantined' : 'activated';

        this.confirmationService.confirm({
            message: `Are you sure you want to ${action} batch ${batch.batchNumber}?`,
            header: quarantine ? 'Quarantine Batch' : 'Activate Batch',
            icon: quarantine ? 'pi pi-exclamation-triangle' : 'pi pi-check-circle',
            accept: () => {
                this.inventoryService.quarantineBatch(batch.id, quarantine).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: `Batch ${batch.batchNumber} ${actionPast} successfully`
                        });
                        // Reload all tabs to reflect the status change
                        this.loadExpiredBatches();
                        this.loadExpiringSoonBatches();
                        this.loadAllBatches();
                    },
                    error: (err) => {
                        console.error(`Failed to ${action} batch`, err);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: `Failed to ${action} batch ${batch.batchNumber}`
                        });
                    }
                });
            }
        });
    }

    getBatchStatusLabel(status: number): string {
        switch (status) {
            case 0: return 'Active';
            case 1: return 'Quarantined';
            case 2: return 'Expired';
            case 3: return 'Depleted';
            case 4: return 'Closed';
            default: return 'Unknown';
        }
    }

    getBatchStatusSeverity(status: number): 'success' | 'danger' | 'info' | 'warn' | 'secondary' | 'contrast' {
        switch (status) {
            case 0: return 'success';    // Active - Green
            case 1: return 'warn';       // Quarantined - Orange/Yellow
            case 2: return 'danger';     // Expired - Red
            case 3: return 'secondary';  // Depleted - Gray
            case 4: return 'secondary';  // Closed - Gray
            default: return 'secondary';
        }
    }
}
