import { Component, OnInit, ChangeDetectorRef, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
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
import { MedicineService } from '../../service/medicine.service';
import { Medicine } from '../../models/models';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoggingService } from '../../core/services/logging.service';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { TIMEOUTS } from '../../core/constants/app.constants';

@Component({
    selector: 'app-medicines-list',
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
    templateUrl: './medicines-list.html'
})
export class MedicinesList implements OnInit {
    medicines: Medicine[] = [];
    loading: boolean = false;
    totalRecords: number = 0;
    pageSize: number = 10;
    currentPage: number = 1;
    searchQuery: string = '';

    statusOptions: any[] = [
        { label: 'All Status', value: null },
        { label: 'Active', value: true },
        { label: 'Inactive', value: false }
    ];
    selectedStatus: boolean | null = null; // null = All, true = Active, false = Inactive
    sortField: string = 'name';
    sortOrder: number = 1;

    private searchSubject = new Subject<string>();
    private destroyRef = inject(DestroyRef);

    constructor(
        private medicineService: MedicineService,
        private router: Router,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private cdr: ChangeDetectorRef,
        private loggingService: LoggingService,
        private errorHandler: ErrorHandlerService
    ) { }

    ngOnInit(): void {
        // Setup search debounce with automatic cleanup
        this.searchSubject
            .pipe(
                debounceTime(TIMEOUTS.SEARCH_DEBOUNCE),
                distinctUntilChanged(),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe(query => {
                if (query.trim()) {
                    this.performSearch(query);
                } else {
                    this.loadMedicinesData(1, this.pageSize);
                }
            });
        // Initial load is handled by the table's lazy load event.
        // The (onLazyLoad) event fires automatically on component initialization
        // because [lazyLoadOnInit]="true" is set in the template.
    }

    loadMedicines(event: TableLazyLoadEvent): void {
        const page = event.first! / event.rows! + 1;
        this.currentPage = page;
        this.pageSize = event.rows!;

        // Capture sort parameters
        this.loggingService.debug('Lazy Load Event:', event);
        this.sortField = event.sortField as string;
        this.loggingService.debug(`Sort Field: ${this.sortField}, Sort Order: ${event.sortOrder}`);
        this.sortOrder = event.sortOrder ?? 1;

        if (this.searchQuery.trim()) {
            this.performSearch(this.searchQuery);
        } else {
            this.loadMedicinesData(page, this.pageSize);
        }
    }

    loadMedicinesData(page: number, pageSize: number): void {
        this.loading = true;
        this.medicineService.getMedicines(page, pageSize, this.selectedStatus === null ? undefined : this.selectedStatus, this.sortField, this.sortOrder).subscribe({
            next: (data) => {
                this.medicines = data.items;
                this.totalRecords = data.totalCount;
                this.loading = false;
                this.cdr.detectChanges(); // Manually trigger change detection
            },
            error: (error) => {
                this.errorHandler.handleError(error, 'Failed to load medicines');
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    onSearch(): void {
        this.searchSubject.next(this.searchQuery);
    }

    onStatusChange(): void {
        if (this.searchQuery.trim()) {
            this.performSearch(this.searchQuery);
        } else {
            this.loadMedicinesData(1, this.pageSize);
        }
    }

    clearSearch(): void {
        this.searchQuery = '';
        this.onSearch();
    }

    performSearch(query: string): void {
        this.loading = true;

        this.medicineService.searchMedicines(query, this.selectedStatus === null ? undefined : this.selectedStatus, this.sortField, this.sortOrder).subscribe({
            next: (results) => {
                this.medicines = results;
                this.totalRecords = results.length;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (error) => {
                this.errorHandler.handleError(error, 'Failed to search medicines');
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    navigateToCreate(): void {
        this.router.navigate(['/medicines/new']);
    }

    navigateToEdit(id: number): void {
        this.router.navigate(['/medicines/edit', id]);
    }

    confirmDelete(medicine: Medicine): void {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete ${medicine.name}?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.deleteMedicine(medicine.id);
            }
        });
    }

    deleteMedicine(id: number): void {
        this.medicineService.deleteMedicine(id).subscribe({
            next: () => {
                this.errorHandler.handleSuccess('Medicine deleted successfully');
                this.loadMedicinesData(this.currentPage, this.pageSize);
            },
            error: (error) => {
                this.errorHandler.handleError(error, 'Failed to delete medicine');
            }
        });
    }
}
