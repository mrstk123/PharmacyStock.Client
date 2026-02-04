import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TableModule, Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { RoleService, RoleDto, CreateRoleDto } from '../../../service/role.service';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    IconField,
    InputIcon,
    TextareaModule,
    ToastModule,
    CardModule,
    ConfirmDialogModule,
    SelectModule,
    CheckboxModule,
    TagModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './role-list.html'
})
export class RoleList implements OnInit {
  roles: RoleDto[] = [];
  loading: boolean = false;
  saving: boolean = false;

  @ViewChild('dt') dt: Table | undefined;

  displayRoleDialog: boolean = false;
  currentRole: CreateRoleDto = { name: '', description: '', isActive: true };
  currentRoleId: number | null = null; // null means create mode

  statusOptions = [
    { label: 'All Status', value: null },
    { label: 'Active', value: true },
    { label: 'Inactive', value: false }
  ];
  selectedStatus: boolean | null = null;
  searchQuery: string = '';

  constructor(
    private roleService: RoleService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadRoles();
  }

  clearSearch() {
    this.searchQuery = '';
    if (this.dt) {
      this.dt.filterGlobal('', 'contains');
    }
  }

  loadRoles() {
    this.loading = true;
    this.roleService.getRoles().subscribe({
      next: (data) => {
        this.roles = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load roles' });
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get dialogHeader(): string {
    return this.currentRoleId ? 'Edit Role' : 'Create New Role';
  }

  get dialogSaveLabel(): string {
    return this.currentRoleId ? 'Update' : 'Create';
  }

  showCreateRoleDialog() {
    this.currentRole = { name: '', description: '', isActive: true };
    this.currentRoleId = null;
    this.displayRoleDialog = true;
  }

  showEditRoleDialog(role: RoleDto) {
    this.currentRole = { name: role.name, description: role.description, isActive: role.isActive };
    this.currentRoleId = role.id;
    this.displayRoleDialog = true;
  }

  saveRole() {
    if (!this.currentRole.name) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Role name is required' });
      return;
    }

    this.saving = true;

    if (this.currentRoleId) {
      // Update
      this.roleService.updateRole(this.currentRoleId, this.currentRole).subscribe({
        next: (updatedRole) => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Role updated successfully' });
          this.displayRoleDialog = false;
          this.loadRoles();
          this.saving = false;
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update role' });
          this.saving = false;
        }
      });
    } else {
      // Create
      this.roleService.createRole(this.currentRole).subscribe({
        next: (role) => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Role created successfully' });
          this.displayRoleDialog = false;
          this.loadRoles();
          this.saving = false;
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create role' });
          this.saving = false;
        }
      });
    }
  }

  confirmDelete(role: RoleDto) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the role "${role.name}"?`,
      accept: () => {
        this.deleteRole(role.id);
      }
    });
  }

  deleteRole(id: number) {
    this.roleService.deleteRole(id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Role deleted successfully' });
        this.loadRoles();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete role. It may be in use.' });
      }
    });
  }

  managePermissions(roleId: number) {
    this.router.navigate(['/settings/role-permissions'], { queryParams: { roleId: roleId } });
  }
}
