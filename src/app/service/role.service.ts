import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RoleDto {
    id: number;
    name: string;
    description: string;
    isActive: boolean;
}

export interface CreateRoleDto {
    name: string;
    description: string;
    isActive?: boolean;
}

export interface PermissionDto {
    id: number;
    name: string;
    description: string;
}

export interface UpdateRolePermissionsDto {
    permissionIds: number[];
}

@Injectable({
    providedIn: 'root'
})
export class RoleService {
    private apiUrl = `${environment.apiUrl}`;

    constructor(private http: HttpClient) { }

    getRoles(): Observable<RoleDto[]> {
        return this.http.get<RoleDto[]>(`${this.apiUrl}/roles`);
    }

    getRole(id: number): Observable<RoleDto> {
        return this.http.get<RoleDto>(`${this.apiUrl}/roles/${id}`);
    }

    createRole(role: CreateRoleDto): Observable<RoleDto> {
        return this.http.post<RoleDto>(`${this.apiUrl}/roles`, role);
    }

    updateRole(id: number, role: CreateRoleDto): Observable<RoleDto> {
        return this.http.put<RoleDto>(`${this.apiUrl}/roles/${id}`, role);
    }

    deleteRole(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/roles/${id}`);
    }

    getAllPermissions(): Observable<PermissionDto[]> {
        return this.http.get<PermissionDto[]>(`${this.apiUrl}/roles/permissions`);
    }

    getPermissionsByRole(roleId: number): Observable<PermissionDto[]> {
        return this.http.get<PermissionDto[]>(`${this.apiUrl}/roles/${roleId}/permissions`);
    }

    updateRolePermissions(roleId: number, permissionIds: number[]): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/roles/${roleId}/permissions`, { permissionIds });
    }
}
