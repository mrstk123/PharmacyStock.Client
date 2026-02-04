import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Subject } from 'rxjs';
import { DashboardAlerts, DashboardStats, RecentMovement, Notification } from '../models/models';
import { environment } from '../../environments/environment';
import { LoggingService } from '../core/services/logging.service';
import { TIMEOUTS } from '../core/constants/app.constants';

@Injectable({
    providedIn: 'root'
})
export class WebSocketService {
    private hubConnection: signalR.HubConnection | undefined;

    // Observables for dashboard events
    public statsUpdate$ = new Subject<DashboardStats>();
    public alertsUpdate$ = new Subject<DashboardAlerts>();
    public movementAdded$ = new Subject<RecentMovement>(); // RecentMovementDto maps to RecentMovement
    public notification$ = new Subject<{ message: string; type: string; timestamp: string }>();
    public notificationAdded$ = new Subject<Notification>();
    public connectionStatus$ = new BehaviorSubject<boolean>(false);

    constructor(private loggingService: LoggingService) {
        this.startConnection();
    }

    public startConnection = () => {
        const hubUrl = environment.hubUrl;

        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(hubUrl)
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();

        this.hubConnection
            .start()
            .then(() => {
                this.loggingService.log('SignalR Connection started');
                this.connectionStatus$.next(true);
                this.registerSignalREvents();
            })
            .catch(err => {
                this.loggingService.error('Error while starting SignalR connection:', err);
                this.connectionStatus$.next(false);
                // Retry logic could go here if automatic reconnect isn't enough for initial connection
                setTimeout(() => this.startConnection(), TIMEOUTS.WEBSOCKET_RECONNECT_DELAY);
            });

        this.hubConnection.onreconnecting(() => {
            this.loggingService.log('SignalR Reconnecting...');
            this.connectionStatus$.next(false);
        });

        this.hubConnection.onreconnected(() => {
            this.loggingService.log('SignalR Reconnected');
            this.connectionStatus$.next(true);
        });

        this.hubConnection.onclose(() => {
            this.loggingService.log('SignalR Connection closed');
            this.connectionStatus$.next(false);
        });
    }

    private registerSignalREvents() {
        if (!this.hubConnection) return;

        this.hubConnection.on('StatsUpdated', (data: DashboardStats) => {
            this.statsUpdate$.next(data);
        });

        this.hubConnection.on('AlertsUpdated', (data: DashboardAlerts) => {
            this.alertsUpdate$.next(data);
        });

        this.hubConnection.on('MovementAdded', (data: RecentMovement) => {
            this.movementAdded$.next(data);
        });

        this.hubConnection.on('Notification', (data: { message: string; type: string; timestamp: string }) => {
            this.notification$.next(data);
        });

        this.hubConnection.on('NotificationAdded', (data: Notification) => {
            this.notificationAdded$.next(data);
        });
    }
}
