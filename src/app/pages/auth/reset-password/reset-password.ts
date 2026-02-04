import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../../../service/auth.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { LayoutService } from '../../../layout/service/layout.service';
import { finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-reset-password',
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
        InputTextModule,
        PasswordModule,
        FormsModule,
        ToastModule,
        RouterLink
    ],
    providers: [MessageService],
    templateUrl: './reset-password.html'
})
export class ResetPassword implements OnInit {
    token: string = '';
    password: string = '';
    confirmPassword: string = '';
    loading = false;
    private destroyRef = inject(DestroyRef);

    constructor(
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute,
        private messageService: MessageService,
        public layoutService: LayoutService
    ) { }

    ngOnInit() {
        this.token = this.route.snapshot.queryParams['token'];
        if (!this.token) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid or missing token' });
            // Optionally redirect after a delay
            // setTimeout(() => this.router.navigate(['/login']), 2000);
        }
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }

    submit() {
        if (!this.password || !this.confirmPassword) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please enter a password' });
            return;
        }

        if (this.password !== this.confirmPassword) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Passwords do not match' });
            return;
        }

        if (!this.token) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Missing reset token' });
            return;
        }

        this.loading = true;
        this.authService.resetPassword({ token: this.token, newPassword: this.password })
            .pipe(
                finalize(() => this.loading = false),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Password has been reset successfully.' });
                    setTimeout(() => this.router.navigate(['/login']), 2000);
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'An error occurred' });
                }
            });
    }
}
