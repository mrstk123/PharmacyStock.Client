import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { MedicineService } from '../../../service/medicine.service';
import { InventoryService } from '../../../service/inventory.service';
import { Medicine, StockCheck, DispensePreview, DispenseResult, AlternativeMedicineDto } from '../../../models/models';
import { Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';

@Component({
    selector: 'app-dispense-stock',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        ButtonModule,
        InputTextModule,
        InputNumberModule,
        SelectModule,
        CardModule,
        ConfirmDialogModule,
        ToastModule,
        DialogModule,
        TableModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './dispense-stock.html'
})
export class DispenseStock implements OnInit {
    stockForm: FormGroup;
    medicines = signal<Medicine[]>([]);
    selectedStock = signal<StockCheck | null>(null);
    loading = signal<boolean>(false);
    showPreviewDialog = signal<boolean>(false);
    previewData = signal<DispensePreview | null>(null);
    showSummaryDialog = signal<boolean>(false);
    summaryData = signal<DispenseResult | null>(null);
    alternatives = signal<AlternativeMedicineDto[]>([]);

    constructor(
        private fb: FormBuilder,
        private medicineService: MedicineService,
        private inventoryService: InventoryService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private router: Router
    ) {
        this.stockForm = this.fb.group({
            medicine: [null, Validators.required],
            quantity: [null, [Validators.required, Validators.min(1)]],
            reason: ['']
        });
    }

    ngOnInit() {
        this.loadMedicines();
    }

    loadMedicines() {
        // Load all medicines for the dropdown
        this.medicineService.getMedicines(1, 1000).subscribe({ // Fetching a large page to get list
            next: (data) => {
                this.medicines.set(data.items);
            },
            error: (err) => console.error('Failed to load medicines', err)
        });
    }

    onMedicineSelect() {
        const medicine = this.stockForm.get('medicine')?.value as Medicine;
        if (medicine) {
            this.loading.set(true);
            this.inventoryService.getStockCheck(medicine.id).subscribe({
                next: (stock) => {
                    this.selectedStock.set(stock);
                    // If no stock available, fetch alternatives
                    if (stock && stock.totalQuantity === 0) {
                        this.inventoryService.getAlternatives(medicine.id).subscribe({
                            next: (alts) => {
                                this.alternatives.set(alts);
                                this.loading.set(false);
                            },
                            error: (err) => {
                                console.error('Error fetching alternatives:', err);
                                this.alternatives.set([]);
                                this.loading.set(false);
                            }
                        });
                    } else {
                        this.alternatives.set([]);
                        this.loading.set(false);
                    }
                },
                error: (err) => {
                    console.error('Failed to load stock check', err);
                    this.loading.set(false);
                    this.alternatives.set([]); // Clear alternatives on error
                }
            });
        } else {
            this.selectedStock.set(null);
            this.alternatives.set([]); // Clear alternatives if no medicine selected
        }
    }

    useAlternative(alternative: AlternativeMedicineDto) {
        // Find the medicine object from the medicines list
        const medicine = this.medicines().find(m => m.id === alternative.medicineId);
        if (medicine) {
            // Set the form value to the alternative medicine
            this.stockForm.patchValue({ medicine });
            // Trigger stock check for the new medicine
            this.onMedicineSelect();
        }
    }

    onSubmit() {
        if (this.stockForm.invalid) return;

        const { medicine, quantity, reason } = this.stockForm.value;
        const currentStock = this.selectedStock();

        if (currentStock && quantity > currentStock.totalQuantity) {
            this.messageService.add({
                severity: 'error',
                summary: 'Insufficient Stock',
                detail: `You requested ${quantity} but only ${currentStock.totalQuantity} is available.`
            });
            return;
        }

        // First, get preview
        this.loading.set(true);
        this.inventoryService.previewDispense(medicine.id, quantity).subscribe({
            next: (preview) => {
                this.loading.set(false);
                if (!preview.canDispense) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Cannot Dispense',
                        detail: preview.message || 'Insufficient stock'
                    });
                    return;
                }
                this.previewData.set(preview);
                this.showPreviewDialog.set(true);
            },
            error: (err) => {
                this.loading.set(false);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: err.error?.message || 'Failed to preview dispense'
                });
            }
        });
    }

    confirmDispense() {
        this.showPreviewDialog.set(false);
        const { medicine, quantity, reason } = this.stockForm.value;
        this.dispense(medicine.id, quantity, reason);
    }

    dispense(medicineId: number, quantity: number, reason: string) {
        this.loading.set(true);
        this.inventoryService.dispenseStock({ medicineId, quantity, reason }).subscribe({
            next: (result) => {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Stock dispensed successfully' });
                this.stockForm.reset();
                this.selectedStock.set(null);
                this.loading.set(false);

                // Show summary dialog
                this.summaryData.set(result);
                this.showSummaryDialog.set(true);
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: err.error?.message || 'Failed to dispense stock'
                });
                this.loading.set(false);
            }
        });
    }
}
