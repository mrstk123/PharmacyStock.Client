import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Add credentials if it's an API request
    if (req.url.includes(environment.apiUrl) || req.url.startsWith('/api') || req.url.startsWith('http')) {
        req = req.clone({
            withCredentials: true
        });
    }

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            // Handle 401 Unauthorized
            if (error.status === 401 && !req.url.includes('/auth/login') && !req.url.includes('/auth/refresh')) {
                return authService.refreshToken().pipe(
                    switchMap(() => {
                        return next(req);
                    }),
                    catchError(refreshError => {
                        // If refresh fails, logout and redirect
                        authService.logout();
                        router.navigate(['/login']);
                        return throwError(() => refreshError);
                    })
                );
            }
            return throwError(() => error);
        })
    );
};
