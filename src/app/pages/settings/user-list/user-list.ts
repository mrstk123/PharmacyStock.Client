import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TableModule, Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Select } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

import { UserService } from '../../../service/user.service';
import { RoleService, RoleDto } from '../../../service/role.service';
import { User, CreateUser, UpdateUser } from '../../../models/models';

@Component({
    selector: 'app-user-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        DialogModule,
        InputTextModule,
        ToastModule,
        ConfirmDialogModule,
        Select,
        CheckboxModule,
        TagModule,
        TooltipModule,
        TooltipModule,
        PasswordModule,
        IconField,
        InputIcon
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './user-list.html'
})
export class UserList implements OnInit {
    users: User[] = [];
    filteredUsers: User[] = [];
    roles: RoleDto[] = [];
    loading: boolean = false;
    saving: boolean = false;

    displayUserDialog: boolean = false;

    userForm: any = {
        username: '',
        fullName: '',
        email: '',

        roleId: null,
        isActive: true
    };

    @ViewChild('dt') dt: Table | undefined;

    selectedRole: RoleDto | null = null;
    selectedStatus: boolean | null = null;
    currentUserId: number | null = null;
    searchQuery: string = '';

    constructor(
        private userService: UserService,
        private roleService: RoleService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.loadUsers();
        this.loadRoles();
    }

    statusOptions = [
        { label: 'All Status', value: null },
        { label: 'Active', value: true },
        { label: 'Inactive', value: false }
    ];

    clearSearch() {
        this.searchQuery = '';
        this.filterUsers();
    }

    onSearch() {
        this.filterUsers();
    }

    onStatusChange() {
        this.filterUsers();
    }

    filterUsers() {
        let result = [...this.users];

        // Filter by Status
        if (this.selectedStatus !== null) {
            result = result.filter(u => u.isActive === this.selectedStatus);
        }

        // Filter by Search Query
        if (this.searchQuery && this.searchQuery.trim()) {
            const query = this.searchQuery.toLowerCase().trim();
            result = result.filter(u =>
                u.username.toLowerCase().includes(query) ||
                u.fullName.toLowerCase().includes(query) ||
                u.email.toLowerCase().includes(query) ||
                (u.roleName && u.roleName.toLowerCase().includes(query))
            );
        }

        this.filteredUsers = result;
    }

    loadUsers() {
        this.loading = true;
        this.userService.getUsers().subscribe({
            next: (data) => {
                this.users = data;
                this.filterUsers(); // Initial filter
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load users' });
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    loadRoles() {
        this.roleService.getRoles().subscribe({
            next: (data) => {
                this.roles = data;
                this.cdr.detectChanges();
            }
        });
    }

    get dialogHeader(): string {
        return this.currentUserId ? 'Edit User' : 'Create New User';
    }

    get dialogSaveLabel(): string {
        return this.currentUserId ? 'Update' : 'Create';
    }

    showCreateUserDialog() {
        this.currentUserId = null;
        this.userForm = {
            username: '',
            fullName: '',
            email: '',
            roleId: null,
            isActive: true
        };
        this.selectedRole = null;
        this.displayUserDialog = true;
    }

    showEditUserDialog(user: User) {
        this.currentUserId = user.id;
        this.userForm = {
            username: user.username,
            fullName: user.fullName,
            email: user.email,
            password: '',
            roleId: user.roleId,
            isActive: user.isActive
        };
        this.selectedRole = this.roles.find(r => r.id === user.roleId) || null;
        this.displayUserDialog = true;
    }

    saveUser() {
        if (!this.userForm.username && !this.currentUserId) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Username is required' });
            return;
        }

        if (!this.selectedRole) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Role is required' });
            return;
        }

        this.saving = true;

        if (this.currentUserId) {
            // Update
            const updateDto: UpdateUser = {
                id: this.currentUserId,
                fullName: this.userForm.fullName,
                email: this.userForm.email,
                roleId: this.selectedRole.id,
                isActive: this.userForm.isActive
            };



            this.userService.updateUser(this.currentUserId, updateDto).subscribe({
                next: (updatedUser) => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User updated successfully' });
                    this.displayUserDialog = false;
                    this.loadUsers();
                    this.saving = false;
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to update user' });
                    this.saving = false;
                }
            });
        } else {
            // Create
            if (!this.userForm.email) {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Email is required for new users' });
                this.saving = false;
                return;
            }

            const createDto: CreateUser = {
                username: this.userForm.username,
                fullName: this.userForm.fullName,
                email: this.userForm.email,
                roleId: this.selectedRole.id
            };

            this.userService.createUser(createDto).subscribe({
                next: (newUser) => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User created successfully' });
                    this.displayUserDialog = false;
                    this.loadUsers();
                    this.saving = false;
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to create user' });
                    this.saving = false;
                }
            });
        }
    }

    confirmDelete(user: User) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete user "${user.username}"? This will deactivate their account.`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.userService.deleteUser(user.id).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User deactivated' });
                        this.loadUsers();
                    },
                    error: (err) => {
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete user' });
                    }
                });
            }
        });
    }
}
