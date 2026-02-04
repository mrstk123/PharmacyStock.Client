import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SupplierService } from '../../service/supplier.service';
import { CreateSupplier, UpdateSupplier } from '../../models/models';

@Component({
    selector: 'app-supplier-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        InputTextModule,
        ToggleSwitch,
        ButtonModule,
        ToastModule
    ],
    providers: [MessageService],
    templateUrl: './supplier-form.html'
})
export class SupplierForm implements OnInit {
    supplierForm: FormGroup;
    isEditMode: boolean = false;
    supplierId?: number;
    saving: boolean = false;
    private destroyRef = inject(DestroyRef);

    constructor(
        private fb: FormBuilder,
        private supplierService: SupplierService,
        private router: Router,
        private route: ActivatedRoute,
        private messageService: MessageService
    ) {
        this.supplierForm = this.fb.group({
            supplierCode: ['', Validators.required],
            name: ['', Validators.required],
            contactInfo: [''],
            isActive: [true]
        });
    }

    ngOnInit(): void {
        // Check if we're in edit mode
        this.route.params.pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe(params => {
            if (params['id']) {
                this.isEditMode = true;
                this.supplierId = +params['id'];
                this.loadSupplier(this.supplierId);
            }
        });
    }

    loadSupplier(id: number): void {
        this.supplierService.getSupplierById(id).pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe({
            next: (supplier) => {
                this.supplierForm.patchValue({
                    supplierCode: supplier.supplierCode,
                    name: supplier.name,
                    contactInfo: supplier.contactInfo,
                    isActive: supplier.isActive
                });
            },
            error: (error) => {
                console.error('Error loading supplier:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load supplier details'
                });
                this.router.navigate(['/suppliers']);
            }
        });
    }

    onSubmit(): void {
        if (this.supplierForm.invalid) {
            this.supplierForm.markAllAsTouched();
            return;
        }

        this.saving = true;

        if (this.isEditMode && this.supplierId) {
            const updateData: UpdateSupplier = {
                id: this.supplierId,
                ...this.supplierForm.value
            };

            this.supplierService.updateSupplier(this.supplierId, updateData).pipe(
                takeUntilDestroyed(this.destroyRef)
            ).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Supplier updated successfully'
                    });
                    setTimeout(() => {
                        this.router.navigate(['/suppliers']);
                    }, 1000);
                },
                error: (error) => {
                    console.error('Error updating supplier:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to update supplier'
                    });
                    this.saving = false;
                }
            });
        } else {
            const createData: CreateSupplier = this.supplierForm.value;

            this.supplierService.createSupplier(createData).pipe(
                takeUntilDestroyed(this.destroyRef)
            ).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Supplier created successfully'
                    });
                    setTimeout(() => {
                        this.router.navigate(['/suppliers']);
                    }, 1000);
                },
                error: (error) => {
                    console.error('Error creating supplier:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to create supplier'
                    });
                    this.saving = false;
                }
            });
        }
    }

    onCancel(): void {
        this.router.navigate(['/suppliers']);
    }
}
