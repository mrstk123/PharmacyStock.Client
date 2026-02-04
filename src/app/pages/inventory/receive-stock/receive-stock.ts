import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { InventoryService } from '../../../service/inventory.service';
import { MedicineService } from '../../../service/medicine.service';
import { SupplierService } from '../../../service/supplier.service';
import { Medicine, Supplier } from '../../../models/models';

@Component({
    selector: 'app-receive-stock',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ButtonModule,
        InputTextModule,
        InputNumber,
        Select,
        DatePicker,
        CardModule,
        ToastModule,
        ConfirmDialogModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './receive-stock.html'
})
export class ReceiveStock implements OnInit {
    stockForm: FormGroup;
    medicines: Medicine[] = [];
    suppliers: Supplier[] = [];
    loading: boolean = false;
    submitting: boolean = false;

    constructor(
        private fb: FormBuilder,
        private inventoryService: InventoryService,
        private medicineService: MedicineService,
        private supplierService: SupplierService,
        private router: Router,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {
        this.stockForm = this.fb.group({
            medicineId: [null, Validators.required],
            supplierId: [null, Validators.required],
            batchNumber: ['', [Validators.required, Validators.minLength(2)]],
            expiryDate: [null, Validators.required],
            initialQuantity: [null, [Validators.required, Validators.min(1)]],
            purchasePrice: [null, [Validators.required, Validators.min(0)]],
            sellingPrice: [null, [Validators.required, Validators.min(0)]]
        });
    }

    ngOnInit(): void {
        this.loadMedicines();
        this.loadSuppliers();
    }

    loadMedicines(): void {
        // Load all medicines for the dropdown (using large page size to get all)
        this.medicineService.getMedicines(1, 1000).subscribe({
            next: (data) => {
                this.medicines = data.items;
            },
            error: (err) => {
                console.error('Error loading medicines', err);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load medicines' });
            }
        });
    }

    loadSuppliers(): void {
        this.supplierService.getSuppliers().subscribe({
            next: (data) => {
                this.suppliers = data.filter(s => s.isActive);
            },
            error: (err) => {
                console.error('Error loading suppliers', err);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load suppliers' });
            }
        });
    }

    onSubmit(): void {
        if (this.stockForm.invalid) {
            this.stockForm.markAllAsTouched();
            return;
        }

        const formValue = this.stockForm.value;
        const medicineId = formValue.medicineId;
        const batchNumber = formValue.batchNumber.toUpperCase().trim();

        // Update form value with uppercase batch number so it's sent correctly
        this.stockForm.patchValue({ batchNumber: batchNumber }, { emitEvent: false });

        this.submitting = true;

        // Check for existing batch
        this.inventoryService.checkBatchExists(medicineId, batchNumber).subscribe({
            next: (existingBatch) => {
                // Batch exists - Prompt user
                this.confirmationService.confirm({
                    message: `Batch "${batchNumber}" already exists for this medicine. Do you want to add stock to it?`,
                    header: 'Batch Exists',
                    icon: 'pi pi-exclamation-triangle',
                    acceptLabel: 'Yes, Add Stock',
                    rejectLabel: 'Cancel',
                    acceptButtonStyleClass: 'p-button-warning',
                    accept: () => {
                        this.processBatchCreation(formValue, batchNumber);
                    },
                    reject: () => {
                        this.submitting = false;
                    }
                });
            },
            error: (err) => {
                if (err.status === 404) {
                    // Batch logic: 404 means it doesn't exist, so we can create it
                    this.processBatchCreation(formValue, batchNumber);
                } else {
                    console.error('Error checking batch', err);
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to verify batch uniqueness' });
                    this.submitting = false;
                }
            }
        });
    }

    private processBatchCreation(formValue: any, batchNumber: string): void {
        this.submitting = true; // Ensure loading state

        const expiryDate = formValue.expiryDate instanceof Date
            ? `${formValue.expiryDate.getFullYear()}-${String(formValue.expiryDate.getMonth() + 1).padStart(2, '0')}-${String(formValue.expiryDate.getDate()).padStart(2, '0')}`
            : formValue.expiryDate;

        const batchData = {
            ...formValue,
            batchNumber: batchNumber, // Ensure uppercase
            expiryDate: expiryDate
        };

        this.inventoryService.createBatch(batchData).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Stock received successfully' });
                this.submitting = false;

                setTimeout(() => {
                    this.router.navigate(['/inventory']);
                }, 1000);
            },
            error: (err) => {
                if (err.status === 409) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Validation Error',
                        detail: err.error.message || 'Batch conflict detected'
                    });
                } else {
                    console.error('Error creating batch', err);
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to receive stock' });
                }
                this.submitting = false;
            }
        });
    }

    onCancel(): void {
        this.router.navigate(['/inventory']);
    }
}
