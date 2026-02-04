import { Component, OnInit, ChangeDetectorRef, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { ConfirmationService, MessageService } from 'primeng/api';
import { SupplierService } from '../../service/supplier.service';
import { Supplier } from '../../models/models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
    selector: 'app-suppliers-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        IconField,
        InputIcon,
        TagModule,
        TooltipModule,
        ConfirmDialogModule,
        ToastModule,
        SelectModule
    ],
    providers: [ConfirmationService, MessageService],
    templateUrl: './suppliers-list.html'
})
export class SuppliersList implements OnInit {
    suppliers: Supplier[] = [];
    filteredSuppliers: Supplier[] = [];
    loading: boolean = false;
    searchQuery: string = '';
    private destroyRef = inject(DestroyRef);

    statusOptions: any[] = [
        { label: 'All Status', value: null },
        { label: 'Active', value: true },
        { label: 'Inactive', value: false }
    ];
    selectedStatus: boolean | null = null;

    private searchSubject = new Subject<string>();

    constructor(
        private supplierService: SupplierService,
        private router: Router,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private cdr: ChangeDetectorRef
    ) {
    }

    ngOnInit(): void {
        this.loadSuppliers();
    }

    loadSuppliers(): void {
        this.loading = true;
        // Pass undefined to get all suppliers, we will filter locally
        this.supplierService.getSuppliers().pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe({
            next: (suppliers) => {
                this.suppliers = suppliers;
                this.applyFilters();
                this.loading = false;
                // Manually trigger change detection to prevent NG0100 error
                this.cdr.detectChanges();
            },
            error: (error) => {
                console.error('Error loading suppliers:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load suppliers'
                });
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    onSearch(): void {
        this.applyFilters();
    }

    onStatusChange(): void {
        this.applyFilters();
    }

    clearSearch(): void {
        this.searchQuery = '';
        this.applyFilters();
    }

    applyFilters(): void {
        let filtered = [...this.suppliers];

        // Apply status filter
        if (this.selectedStatus !== null) {
            filtered = filtered.filter(s => s.isActive === this.selectedStatus);
        }

        // Apply search filter
        if (this.searchQuery.trim()) {
            const lowerQuery = this.searchQuery.toLowerCase();
            filtered = filtered.filter(supplier =>
                supplier.supplierCode.toLowerCase().includes(lowerQuery) ||
                supplier.name.toLowerCase().includes(lowerQuery) ||
                (supplier.contactInfo && supplier.contactInfo.toLowerCase().includes(lowerQuery))
            );
        }

        this.filteredSuppliers = filtered;
    }

    navigateToCreate(): void {
        this.router.navigate(['/suppliers/new']);
    }

    navigateToEdit(id: number): void {
        this.router.navigate(['/suppliers/edit', id]);
    }

    confirmDelete(supplier: Supplier): void {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete ${supplier.name}?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.deleteSupplier(supplier.id);
            }
        });
    }

    deleteSupplier(id: number): void {
        this.supplierService.deleteSupplier(id).pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Supplier deleted successfully'
                });
                this.loadSuppliers();
            },
            error: (error) => {
                console.error('Error deleting supplier:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to delete supplier'
                });
            }
        });
    }
}
