import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map, catchError, of } from 'rxjs';
import { LoginRequest, LoginResponse } from '../models/models';
import { Router } from '@angular/router';
import { UserService } from './user.service';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = `${environment.apiUrl}/auth`;
    private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
    public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

    get isAuthenticated(): boolean {
        return this.isAuthenticatedSubject.value;
    }

    // Add user subject
    private currentUserSubject = new BehaviorSubject<string | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient, private router: Router, private userService: UserService) { }

    checkAuth(): Observable<boolean> {
        return this.userService.getMe().pipe(
            tap(user => {
                this.isAuthenticatedSubject.next(true);
                this.currentUserSubject.next(user.username);
            }),
            map(() => true),
            catchError(() => {
                this.isAuthenticatedSubject.next(false);
                this.currentUserSubject.next(null);
                return of(false);
            })
        );
    }

    login(credentials: LoginRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
            tap(response => {
                this.isAuthenticatedSubject.next(true);
                if (response.username) {
                    this.currentUserSubject.next(response.username);
                }
            })
        );
    }

    refreshToken(): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.apiUrl}/refresh`, {});
    }

    forgotPassword(email: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/forgot-password`, { email });
    }

    resetPassword(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/reset-password`, data);
    }

    logout(): void {
        this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
            next: () => this.doLogout(),
            error: () => this.doLogout()
        });
    }

    private doLogout(): void {
        this.isAuthenticatedSubject.next(false);
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
    }
}