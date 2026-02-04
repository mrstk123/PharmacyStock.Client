import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { LoggingService } from './logging.service';
import { TOAST_DURATIONS } from '../constants/app.constants';

@Injectable({
    providedIn: 'root'
})
export class ErrorHandlerService {

    constructor(
        private messageService: MessageService,
        private loggingService: LoggingService
    ) { }

    /**
     * Handle errors with consistent user feedback and logging
     * @param error - The error object from the API or service
     * @param userMessage - Optional custom message to show the user
     */
    handleError(error: any, userMessage?: string): void {
        const errorMessage = userMessage || this.extractErrorMessage(error);

        // Log technical details to console
        this.loggingService.error('Error occurred:', error);

        // Show user-friendly message
        this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: errorMessage,
            life: TOAST_DURATIONS.ERROR
        });
    }

    /**
     * Show success message to user
     * @param message - Success message to display
     */
    handleSuccess(message: string, summary: string = 'Success'): void {
        this.messageService.add({
            severity: 'success',
            summary: summary,
            detail: message,
            life: TOAST_DURATIONS.SUCCESS
        });
    }

    /**
     * Show info message to user
     * @param message - Info message to display
     */
    handleInfo(message: string, summary: string = 'Info'): void {
        this.messageService.add({
            severity: 'info',
            summary: summary,
            detail: message,
            life: TOAST_DURATIONS.INFO
        });
    }

    /**
     * Show warning message to user
     * @param message - Warning message to display
     */
    handleWarning(message: string, summary: string = 'Warning'): void {
        this.messageService.add({
            severity: 'warn',
            summary: summary,
            detail: message,
            life: TOAST_DURATIONS.WARNING
        });
    }

    /**
     * Extract a user-friendly error message from various error formats
     * @param error - The error object
     * @returns A user-friendly error message
     */
    private extractErrorMessage(error: any): string {
        // Handle HTTP error responses
        if (error?.error) {
            // Check for error message in error.error.message
            if (typeof error.error === 'object' && error.error.message) {
                return error.error.message;
            }
            // Check for error message in error.error.title (Problem Details format)
            if (typeof error.error === 'object' && error.error.title) {
                return error.error.title;
            }
            // If error.error is a string
            if (typeof error.error === 'string') {
                return error.error;
            }
        }

        // Handle standard Error objects
        if (error?.message) {
            return error.message;
        }

        // Handle HTTP status codes
        if (error?.status) {
            switch (error.status) {
                case 400:
                    return 'Invalid request. Please check your input.';
                case 401:
                    return 'Unauthorized. Please log in again.';
                case 403:
                    return 'You do not have permission to perform this action.';
                case 404:
                    return 'The requested resource was not found.';
                case 500:
                    return 'A server error occurred. Please try again later.';
                case 503:
                    return 'Service temporarily unavailable. Please try again later.';
                default:
                    return `An error occurred (Status: ${error.status})`;
            }
        }

        // Default fallback message
        return 'An unexpected error occurred. Please try again.';
    }
}
