import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated) {
        return true;
    }

    return authService.checkAuth().pipe(
        map(isAuthenticated => {
            if (isAuthenticated) {
                return true;
            }
            return router.createUrlTree(['/login']);
        })
    );
};
