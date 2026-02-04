import { Component, OnInit, signal, effect } from '@angular/core';
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
import { Medicine, MedicineBatch } from '../../../models/models';
import { Router } from '@angular/router';

@Component({
    selector: 'app-stock-adjustment',
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
        ToastModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './stock-adjustment.html'
})
export class StockAdjustment implements OnInit {
    adjustmentForm: FormGroup;
    medicines = signal<Medicine[]>([]);
    batches = signal<MedicineBatch[]>([]);
    loading = signal<boolean>(false);

    // Computed UI helpers
    currentQuantity = signal<number>(0);
    adjustmentDiff = signal<number>(0);

    constructor(
        private fb: FormBuilder,
        private medicineService: MedicineService,
        private inventoryService: InventoryService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private router: Router
    ) {
        this.adjustmentForm = this.fb.group({
            medicine: [null, Validators.required],
            batch: [{ value: null, disabled: true }, Validators.required],
            newQuantity: [{ value: null, disabled: true }, [Validators.required, Validators.min(0)]],

            reason: ['', Validators.required]
        });
    }

    ngOnInit() {
        this.loadMedicines();
    }

    loadMedicines() {
        this.medicineService.getMedicines(1, 1000).subscribe({
            next: (data) => this.medicines.set(data.items),
            error: (err) => console.error('Failed to load medicines', err)
        });
    }

    onMedicineSelect() {
        const medicine = this.adjustmentForm.get('medicine')?.value;
        this.batches.set([]);
        this.adjustmentForm.patchValue({
            batch: null,
            newQuantity: null,

        });
        this.adjustmentForm.get('batch')?.disable();
        this.adjustmentForm.get('newQuantity')?.disable();

        this.currentQuantity.set(0);
        this.adjustmentDiff.set(0);

        if (medicine) {
            this.loading.set(true);
            this.inventoryService.getBatches().subscribe({
                next: (allBatches) => {
                    const medsBatches = allBatches.filter(b => b.medicineId === medicine.id && b.isActive);
                    this.batches.set(medsBatches);
                    this.adjustmentForm.get('batch')?.enable();
                    this.loading.set(false);
                },
                error: (err) => {
                    console.error('Failed to load batches', err);
                    this.loading.set(false);
                }
            });
        }
    }

    onBatchSelect() {
        const batch = this.adjustmentForm.get('batch')?.value;
        if (batch) {
            this.currentQuantity.set(batch.currentQuantity);

            this.adjustmentForm.get('newQuantity')?.enable();


            this.adjustmentForm.patchValue({
                newQuantity: batch.currentQuantity,

            });

            this.calculateDiff();
        } else {
            this.currentQuantity.set(0);
            this.adjustmentForm.get('newQuantity')?.disable();

            this.adjustmentDiff.set(0);
        }
    }

    calculateDiff() {
        const newQty = this.adjustmentForm.get('newQuantity')?.value;
        if (newQty !== null && newQty !== undefined) {
            this.adjustmentDiff.set(newQty - this.currentQuantity());
        }
    }

    onSubmit() {
        if (this.adjustmentForm.invalid) return;

        const { batch, newQuantity, reason } = this.adjustmentForm.value;
        const diff = this.adjustmentDiff();

        if (diff === 0) {
            this.messageService.add({ severity: 'warn', summary: 'No Change', detail: 'Quantity is unchanged.' });
            return;
        }

        this.confirmationService.confirm({
            message: `Adjusting batch '${batch.batchNumber}'. proceed?`,
            header: 'Confirm Adjustment',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                console.log('Adjusting Stock:', { batchId: batch.id, newQuantity, reason });
                this.adjust(batch.id, newQuantity, reason);
            }
        });
    }

    adjust(batchId: number, newQuantity: number, reason: string) {
        this.loading.set(true);
        this.inventoryService.adjustStock({ batchId, newQuantity, reason }).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Stock adjusted successfully' });
                this.resetForm();
                this.loading.set(false);
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: err.error?.message || 'Failed to adjust stock'
                });
                this.loading.set(false);
            }
        });
    }

    resetForm() {
        this.adjustmentForm.reset();
        this.batches.set([]);
        this.currentQuantity.set(0);
        this.adjustmentDiff.set(0);
        this.adjustmentForm.get('batch')?.disable();
        this.adjustmentForm.get('newQuantity')?.disable();

    }
}
