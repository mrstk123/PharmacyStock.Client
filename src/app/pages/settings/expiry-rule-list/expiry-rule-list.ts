import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CheckboxModule } from 'primeng/checkbox';
import { Select } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ExpiryRuleService, ExpiryRuleDto, CreateExpiryRuleDto } from '../../../service/expiry-rule.service';
import { CategoryService } from '../../../service/category.service';
import { Category } from '../../../models/models';

@Component({
    selector: 'app-expiry-rule-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        InputNumberModule,
        DialogModule,
        ToastModule,
        ConfirmDialogModule,
        CheckboxModule,
        Select,
        TagModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './expiry-rule-list.html'
})
export class ExpiryRuleList implements OnInit {
    rules: ExpiryRuleDto[] = [];
    filteredRules: ExpiryRuleDto[] = [];
    categories: Category[] = [];
    filterCategories: Category[] = [];
    loading: boolean = true;
    displayDialog: boolean = false;
    isEdit: boolean = false;
    currentRule: ExpiryRuleDto | null = null;

    selectedCategory: Category | null = null;
    filterCategory: Category | null = null;

    statusOptions: any[] = [
        { label: 'All Status', value: null },
        { label: 'Active', value: true },
        { label: 'Inactive', value: false }
    ];
    selectedStatus: boolean | null = null;

    ruleForm: CreateExpiryRuleDto = {
        categoryId: null,
        warningDays: 30,
        criticalDays: 7,
        isActive: true
    };

    constructor(
        private expiryRuleService: ExpiryRuleService,
        private categoryService: CategoryService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.loadRules();
        this.loadCategories();
    }

    loadRules() {
        this.loading = true;
        this.expiryRuleService.getExpiryRules().subscribe({
            next: (data) => {
                this.rules = data;
                this.applyFilter();
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load expiry rules' });
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    applyFilter() {
        let filtered = [...this.rules];

        if (this.selectedStatus !== null) {
            filtered = filtered.filter(r => r.isActive === this.selectedStatus);
        }

        if (this.filterCategory) {
            if (this.filterCategory.id === -1) {
                // Global Default (categoryId is null)
                filtered = filtered.filter(r => r.categoryId === null);
            } else {
                filtered = filtered.filter(r => r.categoryId === this.filterCategory!.id);
            }
        }

        this.filteredRules = filtered;
    }

    clearFilters() {
        this.selectedStatus = null;
        this.filterCategory = null;
        this.applyFilter();
    }

    loadCategories() {
        this.categoryService.getCategories().subscribe({
            next: (data) => {
                this.categories = data;
                // Add Global Default option for filtering only
                this.filterCategories = [
                    { id: -1, name: 'Global Default', isActive: true, description: 'Default rule for all other categories' },
                    ...data
                ];
            }
        });
    }

    showDialog(rule?: ExpiryRuleDto) {
        if (rule) {
            this.isEdit = true;
            this.currentRule = rule;
            this.ruleForm = {
                categoryId: rule.categoryId,
                warningDays: rule.warningDays,
                criticalDays: rule.criticalDays,
                isActive: rule.isActive
            };
            this.selectedCategory = rule.categoryId
                ? this.categories.find(c => c.id === rule.categoryId) || null
                : null;
        } else {
            this.isEdit = false;
            this.currentRule = null;
            this.ruleForm = {
                categoryId: null,
                warningDays: 90,
                criticalDays: 30,
                isActive: true
            };
            this.selectedCategory = null;
        }
        this.displayDialog = true;
    }

    hideDialog() {
        this.displayDialog = false;
    }

    saveRule() {
        this.ruleForm.categoryId = this.selectedCategory ? this.selectedCategory.id : null;

        if (this.isEdit && this.currentRule) {
            this.expiryRuleService.updateExpiryRule(this.currentRule.id, this.ruleForm).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Rule updated' });
                    this.loadRules();
                    this.hideDialog();
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to update rule' });
                }
            });
        } else {
            this.expiryRuleService.createExpiryRule(this.ruleForm).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Rule created' });
                    this.loadRules();
                    this.hideDialog();
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to create rule' });
                }
            });
        }
    }

    confirmDelete(rule: ExpiryRuleDto) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete the expiry rule for ${rule.categoryName}?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.expiryRuleService.deleteExpiryRule(rule.id).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Rule deleted' });
                        this.loadRules();
                    },
                    error: (err) => {
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete rule' });
                    }
                });
            }
        });
    }
}
