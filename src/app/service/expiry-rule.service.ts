import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ExpiryRuleDto {
    id: number;
    categoryId: number | null;
    categoryName: string;
    warningDays: number;
    criticalDays: number;
    isActive: boolean;
}

export interface CreateExpiryRuleDto {
    categoryId: number | null;
    warningDays: number;
    criticalDays: number;
    isActive: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class ExpiryRuleService {
    private apiUrl = `${environment.apiUrl}/expiryRules`;

    constructor(private http: HttpClient) { }

    getExpiryRules(): Observable<ExpiryRuleDto[]> {
        return this.http.get<ExpiryRuleDto[]>(this.apiUrl);
    }

    getExpiryRule(id: number): Observable<ExpiryRuleDto> {
        return this.http.get<ExpiryRuleDto>(`${this.apiUrl}/${id}`);
    }

    createExpiryRule(dto: CreateExpiryRuleDto): Observable<ExpiryRuleDto> {
        return this.http.post<ExpiryRuleDto>(this.apiUrl, dto);
    }

    updateExpiryRule(id: number, dto: CreateExpiryRuleDto): Observable<ExpiryRuleDto> {
        return this.http.put<ExpiryRuleDto>(`${this.apiUrl}/${id}`, dto);
    }

    deleteExpiryRule(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
