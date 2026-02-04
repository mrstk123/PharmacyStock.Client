import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserService } from '../../../service/user.service';
import { AuthService } from '../../../service/auth.service';

@Component({
    selector: 'app-change-password',
    standalone: true,
    imports: [CommonModule, FormsModule, PasswordModule, ButtonModule, ToastModule],
    providers: [MessageService],
    templateUrl: './change-password.html'
})
export class ChangePassword {
    currentPassword = '';
    password = '';
    confirmPassword = '';
    loading = false;
    private destroyRef = inject(DestroyRef);

    constructor(
        private userService: UserService,
        private authService: AuthService,
        private messageService: MessageService,
        private router: Router
    ) { }

    cancel() {
        this.router.navigate(['/dashboard']);
    }

    updatePassword() {
        if (!this.currentPassword || !this.password || !this.confirmPassword) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please fill in all fields' });
            return;
        }

        if (this.password !== this.confirmPassword) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'New passwords do not match' });
            return;
        }

        const userIdStr = localStorage.getItem('auth_id') || sessionStorage.getItem('auth_id');
        if (!userIdStr) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'User ID not found. Please log in again.' });
            return;
        }

        this.loading = true;
        const userId = parseInt(userIdStr, 10);

        this.userService.changePassword(userId, {
            currentPassword: this.currentPassword,
            newPassword: this.password
        }).pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Password updated successfully. Logging out...' });
                this.loading = false;
                setTimeout(() => {
                    this.authService.logout();
                }, 1500);
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to update password' });
                this.loading = false;
            }
        });
    }
}
