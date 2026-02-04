import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoggingService {
  private enabled = !environment.production;

  /**
   * Log general information messages
   * Suppressed in production builds
   */
  log(message: string, ...args: any[]): void {
    if (this.enabled) {
      console.log(`[INFO] ${message}`, ...args);
    }
  }

  /**
   * Log debug messages for development
   * Suppressed in production builds
   */
  debug(message: string, ...args: any[]): void {
    if (this.enabled) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }

  /**
   * Log warning messages
   * Shown in all environments
   */
  warn(message: string, ...args: any[]): void {
    console.warn(`[WARN] ${message}`, ...args);
  }

  /**
   * Log error messages
   * Shown in all environments
   * Can be extended to send to remote logging service
   */
  error(message: string, error?: any): void {
    console.error(`[ERROR] ${message}`, error || '');
    
    // TODO: Send to remote error tracking service (Sentry, LogRocket, etc.)
    // if (environment.production && this.errorTrackingService) {
    //   this.errorTrackingService.captureException(error);
    // }
  }
}
