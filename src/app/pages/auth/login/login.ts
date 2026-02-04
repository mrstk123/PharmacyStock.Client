import { Component, ViewChild, ChangeDetectorRef, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { AuthService } from '../../service/auth.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { LayoutService } from '../../layout/service/layout.service';
import { finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
        InputTextModule,
        PasswordModule,
        FormsModule,
        CheckboxModule,
        ToastModule,
        RouterLink
    ],
    providers: [MessageService],
    templateUrl: './login.html'
})
export class Login {
    @ViewChild('loginForm') loginForm!: NgForm;
    username = '';
    password = '';
    rememberMe = false;
    loading = false;

    usernameError: string | null = null;
    passwordError: string | null = null;
    private destroyRef = inject(DestroyRef);

    constructor(
        private authService: AuthService,
        private router: Router,
        private messageService: MessageService,
        public layoutService: LayoutService,
        private cdr: ChangeDetectorRef
    ) { }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }

    login() {
        if (this.loginForm.invalid) {
            this.loginForm.form.markAllAsTouched();
            return;
        }

        this.loading = true;
        this.usernameError = null;
        this.passwordError = null;

        this.authService.login({
            username: this.username,
            password: this.password,
            rememberMe: this.rememberMe
        }).pipe(
            finalize(() => {
                this.loading = false;
            }),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe({
            next: () => {
                this.router.navigate(['/dashboard']);
            },
            error: (err) => {
                const errorMessage = err.error?.message;

                if (errorMessage === 'Incorrect username') {
                    this.usernameError = errorMessage;
                } else if (errorMessage === 'Incorrect password') {
                    this.passwordError = errorMessage;
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Login Failed',
                        detail: errorMessage || 'Invalid username or password'
                    });
                }
                setTimeout(() => {
                    this.loginForm.form.markAllAsTouched();
                    this.cdr.detectChanges();
                });
            }
        });
    }
}
