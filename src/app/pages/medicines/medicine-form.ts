import { Component, OnInit, ChangeDetectorRef, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';
import { MedicineService } from '../../service/medicine.service';
import { CategoryService } from '../../service/category.service';
import { Category, CreateMedicine, UpdateMedicine, CreateCategory, UpdateCategory } from '../../models/models';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { TIMEOUTS } from '../../core/constants/app.constants';

@Component({
    selector: 'app-medicine-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        InputTextModule,
        Select,
        ToggleSwitch,
        ButtonModule,
        Dialog,
        TableModule,
        TagModule,
        TooltipModule,
        ConfirmDialogModule,
        ToastModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './medicine-form.html'
})
export class MedicineForm implements OnInit {
    medicineForm: FormGroup;
    categoryForm: FormGroup;
    categories: Category[] = [];
    isEditMode: boolean = false;
    medicineId?: number;
    saving: boolean = false;
    loadingCategories: boolean = false;
    showCategoryDialog: boolean = false;
    showManageDialog: boolean = false;
    savingCategory: boolean = false;
    editingCategory: Category | null = null;
    private destroyRef = inject(DestroyRef);

    constructor(
        private fb: FormBuilder,
        private medicineService: MedicineService,
        private categoryService: CategoryService,
        private router: Router,
        private route: ActivatedRoute,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private cdr: ChangeDetectorRef,
        private errorHandler: ErrorHandlerService
    ) {
        this.medicineForm = this.fb.group({
            medicineCode: ['', Validators.required],
            name: ['', Validators.required],
            genericName: [''],
            manufacturer: [''],
            categoryId: [null, Validators.required],
            unitOfMeasure: ['', Validators.required],
            storageCondition: [''],
            lowStockThreshold: [50, [Validators.required, Validators.min(1)]],
            isActive: [true]
        });

        this.categoryForm = this.fb.group({
            name: ['', Validators.required],
            description: ['']
        });
    }

    ngOnInit(): void {
        this.loadCategories();

        // Check if we're in edit mode
        this.route.params.pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe(params => {
            if (params['id']) {
                this.isEditMode = true;
                this.medicineId = +params['id'];
                this.loadMedicine(this.medicineId);
            }
        });
    }

    loadCategories(): void {
        this.loadingCategories = true;
        this.categoryService.getCategories().pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe({
            next: (categories) => {
                this.categories = categories.filter(c => c.isActive);
                this.loadingCategories = false;
                // Manually trigger change detection to prevent NG0100 error
                this.cdr.detectChanges();
            },
            error: (error) => {
                this.errorHandler.handleError(error, 'Failed to load categories');
                this.loadingCategories = false;
                this.cdr.detectChanges();
            }
        });
    }

    loadMedicine(id: number): void {
        this.medicineService.getMedicineById(id).pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe({
            next: (medicine) => {
                this.medicineForm.patchValue({
                    medicineCode: medicine.medicineCode,
                    name: medicine.name,
                    genericName: medicine.genericName,
                    manufacturer: medicine.manufacturer,
                    categoryId: medicine.categoryId,
                    unitOfMeasure: medicine.unitOfMeasure,
                    storageCondition: medicine.storageCondition,
                    lowStockThreshold: medicine.lowStockThreshold,
                    isActive: medicine.isActive
                });
            },
            error: (error) => {
                this.errorHandler.handleError(error, 'Failed to load medicine details');
                this.router.navigate(['/medicines']);
            }
        });
    }

    onSubmit(): void {
        if (this.medicineForm.invalid) {
            this.medicineForm.markAllAsTouched();
            return;
        }

        this.saving = true;

        if (this.isEditMode && this.medicineId) {
            const updateData: UpdateMedicine = {
                id: this.medicineId,
                ...this.medicineForm.value
            };

            this.medicineService.updateMedicine(this.medicineId, updateData).pipe(
                takeUntilDestroyed(this.destroyRef)
            ).subscribe({
                next: () => {
                    this.errorHandler.handleSuccess('Medicine updated successfully');
                    setTimeout(() => {
                        this.router.navigate(['/medicines']);
                    }, TIMEOUTS.NAVIGATION_DELAY);
                },
                error: (error) => {
                    this.errorHandler.handleError(error, 'Failed to update medicine');
                    this.saving = false;
                }
            });
        } else {
            const createData: CreateMedicine = this.medicineForm.value;

            this.medicineService.createMedicine(createData).pipe(
                takeUntilDestroyed(this.destroyRef)
            ).subscribe({
                next: () => {
                    this.errorHandler.handleSuccess('Medicine created successfully');
                    setTimeout(() => {
                        this.router.navigate(['/medicines']);
                    }, TIMEOUTS.NAVIGATION_DELAY);
                },
                error: (error) => {
                    this.errorHandler.handleError(error, 'Failed to create medicine');
                    this.saving = false;
                }
            });
        }
    }

    onCancel(): void {
        this.router.navigate(['/medicines']);
    }

    showCreateCategoryDialog(): void {
        this.categoryForm.reset();
        this.showCategoryDialog = true;
    }

    hideCategoryDialog(): void {
        this.showCategoryDialog = false;
        this.categoryForm.reset();
    }

    onCreateCategory(): void {
        if (this.categoryForm.invalid) {
            this.categoryForm.markAllAsTouched();
            return;
        }

        this.savingCategory = true;
        const createData: CreateCategory = this.categoryForm.value;

        this.categoryService.createCategory(createData).pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe({
            next: (newCategory) => {
                this.errorHandler.handleSuccess('Category created successfully');
                this.savingCategory = false;
                this.hideCategoryDialog();
                // Reload categories and select the newly created one
                this.loadCategories();
                setTimeout(() => {
                    this.medicineForm.patchValue({ categoryId: newCategory.id });
                }, TIMEOUTS.FORM_UPDATE_DELAY);
            },
            error: (error) => {
                this.errorHandler.handleError(error, 'Failed to create category');
                this.savingCategory = false;
            }
        });
    }

    showManageCategoriesDialog(): void {
        this.showManageDialog = true;
        this.editingCategory = null;
    }

    hideManageDialog(): void {
        this.showManageDialog = false;
        this.editingCategory = null;
    }

    startEditCategory(category: Category): void {
        this.editingCategory = { ...category };
    }

    cancelEditCategory(): void {
        this.editingCategory = null;
    }

    saveEditCategory(): void {
        if (!this.editingCategory || !this.editingCategory.name.trim()) {
            this.errorHandler.handleError(null, 'Category name is required');
            return;
        }

        this.savingCategory = true;
        const updateData: UpdateCategory = {
            id: this.editingCategory.id,
            name: this.editingCategory.name,
            description: this.editingCategory.description,
            isActive: this.editingCategory.isActive
        };

        this.categoryService.updateCategory(this.editingCategory.id, updateData).pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe({
            next: () => {
                this.errorHandler.handleSuccess('Category updated successfully');
                this.savingCategory = false;
                this.editingCategory = null;
                this.loadCategories();
            },
            error: (error) => {
                this.errorHandler.handleError(error, 'Failed to update category');
                this.savingCategory = false;
            }
        });
    }

    confirmDeleteCategory(category: Category): void {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete "${category.name}"?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.deleteCategory(category.id);
            }
        });
    }

    deleteCategory(id: number): void {
        this.categoryService.deleteCategory(id).pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe({
            next: () => {
                this.errorHandler.handleSuccess('Category deleted successfully');
                this.loadCategories();
            },
            error: (error) => {
                this.errorHandler.handleError(error, 'Failed to delete category');
            }
        });
    }
}
