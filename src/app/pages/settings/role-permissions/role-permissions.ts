import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { RoleService, RoleDto, PermissionDto } from '../../../service/role.service';

interface PermissionGroup {
    name: string;
    permissions: PermissionDto[];
}

@Component({
    selector: 'app-role-permissions',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        CheckboxModule,
        ButtonModule,
        ToastModule,
        CardModule
    ],
    providers: [MessageService],
    templateUrl: './role-permissions.html'
})
export class RolePermissions implements OnInit {
    currentRole: RoleDto | null = null;
    allPermissions: PermissionDto[] = [];
    permissionGroups: PermissionGroup[] = [];
    selectedPermissionIds: number[] = [];
    loading: boolean = false;

    constructor(
        private roleService: RoleService,
        private messageService: MessageService,
        private route: ActivatedRoute,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.loadAllPermissions();
        this.checkRouteParams();
    }

    checkRouteParams() {
        this.route.queryParams.subscribe(params => {
            if (params['roleId']) {
                const roleId = Number(params['roleId']);
                if (!isNaN(roleId)) {
                    this.loadRole(roleId);
                    this.loadRolePermissions(roleId);
                } else {
                    this.showError('Invalid Role ID');
                }
            } else {
                this.showError('No Role ID provided');
            }
        });
    }

    loadRole(roleId: number) {
        this.roleService.getRole(roleId).subscribe({
            next: (role) => {
                this.currentRole = role;
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.showError('Failed to load role details');
                this.cdr.detectChanges();
            }
        });
    }

    loadRolePermissions(roleId: number) {
        this.loading = true;
        this.roleService.getPermissionsByRole(roleId).subscribe({
            next: (data) => {
                this.selectedPermissionIds = data.map(p => p.id);
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.showError('Failed to load role permissions');
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    loadAllPermissions() {
        this.roleService.getAllPermissions().subscribe({
            next: (data) => {
                this.allPermissions = data;
                this.groupPermissions();
            },
            error: (err) => this.showError('Failed to load permissions')
        });
    }

    groupPermissions() {
        const groups: { [key: string]: PermissionDto[] } = {};

        this.allPermissions.forEach(p => {
            const parts = p.name.split('.');
            const groupName = parts[0];
            if (!groups[groupName]) {
                groups[groupName] = [];
            }
            groups[groupName].push(p);
        });

        this.permissionGroups = Object.keys(groups).map(key => ({
            name: key,
            permissions: groups[key]
        }));
    }

    savePermissions() {
        if (!this.currentRole) return;

        this.loading = true;
        this.roleService.updateRolePermissions(this.currentRole.id, this.selectedPermissionIds).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Permissions updated successfully' });
                this.loading = false;
            },
            error: (err) => {
                this.showError('Failed to update permissions');
                this.loading = false;
            }
        });
    }

    showError(msg: string) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
    }

    goBack() {
        this.router.navigate(['/settings/roles']);
    }
}
