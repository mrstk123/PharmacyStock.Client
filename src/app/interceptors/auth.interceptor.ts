import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // No need to add token header manually; cookies are used.

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
