import { ChangeDetectorRef, Component, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { InventoryService } from '../../../service/inventory.service';
import { MedicineService } from '../../../service/medicine.service';
import { Medicine, StockMovementDto } from '../../../models/models';
import { SelectItem } from 'primeng/api';

@Component({
    selector: 'app-stock-history',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        DatePickerModule,
        SelectModule,
        CardModule,
        IconFieldModule,
        InputIconModule,
        InputTextModule
    ],
    templateUrl: './stock-history.html'
})
export class StockHistory implements OnInit {
    movements: WritableSignal<StockMovementDto[]> = signal([]);
    medicines: Medicine[] = [];
    medicineOptions: SelectItem[] = [];

    rangeDates: Date[] | undefined;
    selectedMedicine: number | null = null;
    selectedType: string | null = null;

    typeOptions: SelectItem[] = [
        { label: 'All Types', value: null },
        { label: 'IN_Purchase', value: 'IN_Purchase' },
        { label: 'OUT_Dispense', value: 'OUT_Dispense' },
        { label: 'ADJUSTMENT', value: 'ADJUSTMENT' }
    ];

    loading: boolean = false;

    constructor(
        private inventoryService: InventoryService,
        private medicineService: MedicineService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.loadMedicines();
        this.loadMovements();
    }

    loadMedicines() {
        this.medicineService.getMedicines(1, 1000).subscribe(data => {
            this.medicines = data.items;
            this.medicineOptions = [
                { label: 'All Medicines', value: null },
                ...data.items.map(m => ({ label: m.name, value: m.id }))
            ];
            this.cdr.detectChanges();
        });
    }

    loadMovements() {
        this.loading = true;
        let fromDateStr = '';
        let toDateStr = '';

        if (this.rangeDates && this.rangeDates[0]) {
            // Basic formatting YYYY-MM-DD
            fromDateStr = this.formatDate(this.rangeDates[0]);
            if (this.rangeDates[1]) {
                toDateStr = this.formatDate(this.rangeDates[1]);
            } else {
                toDateStr = fromDateStr; // Single date selected means that day
            }
        }

        this.inventoryService.getStockMovements(
            fromDateStr || undefined,
            toDateStr || undefined,
            this.selectedMedicine || undefined,
            this.selectedType || undefined
        ).subscribe({
            next: (data) => {
                this.movements.set(data);
                this.loading = false;
            },
            error: (err) => {
                console.error('Failed to load movements', err);
                this.loading = false;
            }
        });
    }

    formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    applyFilters() {
        this.loadMovements();
    }

    clearFilters() {
        this.rangeDates = undefined;
        this.selectedMedicine = null;
        this.selectedType = null;
        this.loadMovements();
    }

    getSeverity(type: string): 'success' | 'danger' | 'info' | 'warn' | 'secondary' | 'contrast' {
        if (type.startsWith('IN')) return 'success';
        if (type.startsWith('OUT')) return 'warn';
        if (type === 'ADJUSTMENT') return 'info';
        return 'secondary';
    }
}
