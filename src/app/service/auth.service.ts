import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, map, catchError, of } from 'rxjs';
import { HttpService } from './http.service';
import { LoginRequest, LoginResponse } from '../models/models';
import { Router } from '@angular/router';
import { UserService } from './user.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
    public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

    get isAuthenticated(): boolean {
        return this.isAuthenticatedSubject.value;
    }

    // Add user subject
    private currentUserSubject = new BehaviorSubject<string | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpService, private router: Router, private userService: UserService) { }

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
        return this.http.post<LoginResponse>('/auth/login', credentials).pipe(
            tap(response => {
                this.isAuthenticatedSubject.next(true);
                if (response.username) {
                    this.currentUserSubject.next(response.username);
                }
            })
        );
    }

    refreshToken(): Observable<LoginResponse> {
        return this.http.post<LoginResponse>('/auth/refresh', {});
    }

    forgotPassword(email: string): Observable<any> {
        return this.http.post('/auth/forgot-password', { email });
    }

    resetPassword(data: any): Observable<any> {
        return this.http.post('/auth/reset-password', data);
    }

    logout(): void {
        this.http.post('/auth/logout', {}).subscribe({
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