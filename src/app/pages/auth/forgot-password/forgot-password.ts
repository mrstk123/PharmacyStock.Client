import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../../service/auth.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { LayoutService } from '../../../layout/service/layout.service';
import { finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
        InputTextModule,
        FormsModule,
        ToastModule,
        RouterLink
    ],
    providers: [MessageService],
    templateUrl: './forgot-password.html'
})
export class ForgotPassword {
    email: string = '';
    loading = false;
    private destroyRef = inject(DestroyRef);

    constructor(
        private authService: AuthService,
        private router: Router,
        private messageService: MessageService,
        public layoutService: LayoutService
    ) { }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }

    submit() {
        if (!this.email) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please enter your email address' });
            return;
        }

        this.loading = true;
        this.authService.forgotPassword(this.email)
            .pipe(
                finalize(() => this.loading = false),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Password reset instructions have been sent to your email.' });
                    setTimeout(() => this.router.navigate(['/login']), 2000);
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'An error occurred' });
                }
            });
    }
}
