import { Component, OnInit, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MenuModule } from 'primeng/menu';
import { Popover, PopoverModule } from 'primeng/popover';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { LayoutService } from '../service/layout.service';
import { AuthService } from '../../service/auth.service';
import { NotificationService } from '../../service/notification.service';
import { Notification } from '../../models/models';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, MenuModule, PopoverModule, ButtonModule, BadgeModule],
    template: `<div class="layout-topbar">
        <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
            <i class="pi pi-bars"></i>
        </button>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
                    <i [ngClass]="{ 'pi ': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }"></i>
                </button>
            </div>

            <!-- <div class="layout-topbar-menu">
                <div class="layout-topbar-menu-content"> -->
                    <button type="button" class="layout-topbar-action" (click)="op.toggle($event)">
                        <i class="pi pi-inbox" pBadge [value]="unreadCount > 0 ? unreadCount.toString() : ''" [severity]="'danger'"></i>
                        <span>Messages</span>
                    </button>
                    
                    <p-popover #op [style]="{width: '450px'}">
                        <ng-template pTemplate="content">
                            <div class="flex flex-col gap-2">
                                <div class="flex align-items-center justify-content-between mb-0 w-full">
                                    <div class="font-bold text-xl">Notifications</div>
                                    <button pButton label="Mark all as read" icon="pi pi-check-double" 
                                        class="p-button-text p-button-secondary p-button-md ml-auto" 
                                        style="padding: 0.5rem;"
                                    (click)="markAllAsRead()"
                                        pTooltip="Mark all notifications as read" tooltipPosition="bottom"></button>
                                </div>
                                <div class="flex gap-2">
                                    <button pButton 
                                        [label]="'All (' + notifications.length + ')'" 
                                        [class]="filter === 'all' ? 'p-button-md p-button-rounded' : 'p-button-md p-button-rounded p-button-text p-button-secondary'" 
                                        (click)="filter = 'all'"></button>
                                    <button pButton 
                                        [label]="'Unread (' + unreadCount + ')'" 
                                        [class]="filter === 'unread' ? 'p-button-md p-button-rounded' : 'p-button-md p-button-rounded p-button-text p-button-secondary'" 
                                        (click)="filter = 'unread'"></button>
                                </div>
                                <div class="overflow-y-auto" style="max-height: 400px;">
                                    <div *ngIf="visibleNotifications.length === 0" class="p-4 text-center text-gray-500">
                                        No {{filter === 'unread' ? 'unread' : ''}} notifications
                                    </div>
                                    <div *ngFor="let notification of visibleNotifications" 
                                        class="p-3 border-bottom-1 surface-border cursor-pointer hover:surface-hover transition-colors transition-duration-150 relative" 
                                        [ngClass]="{
                                            'opacity-70': notification.isRead
                                        }"
                                        (click)="onNotificationClick(notification)">
                                        <div class="flex align-items-center justify-content-between mb-2">
                                            <span class="font-bold text-lg">{{notification.title}}</span>
                                            <span class="text-sm text-gray-500">{{notification.createdAt | date:'short'}}</span>
                                        </div>
                                        <div class="mb-0">{{notification.message}}</div>
                                    </div>
                                </div>
                            </div>
                        </ng-template>
                    </p-popover>

                    <button type="button" class="layout-topbar-action" (click)="menu.toggle($event)">
                        <i class="pi pi-user"></i>
                        <span>Profile</span>
                    </button>
                    <p-menu #menu [model]="items" [popup]="true" appendTo="body"></p-menu>
                <!-- </div>
            </div> -->
        </div>
    </div>`
})
export class AppTopbar implements OnInit {
    items!: MenuItem[];
    notifications: Notification[] = [];
    filter: 'all' | 'unread' = 'all';

    @ViewChild('op') popover!: Popover;

    constructor(
        public layoutService: LayoutService,
        private authService: AuthService,
        private notificationService: NotificationService
    ) { }

    ngOnInit() {
        this.authService.currentUser$.subscribe(username => {
            const label = username ? `Profile (${username})` : 'Profile';
            this.updateMenu(label);
            if (username) {
                this.loadNotifications();
            }
        });
    }

    get unreadCount(): number {
        return this.notifications.filter(n => !n.isRead).length;
    }

    get visibleNotifications(): Notification[] {
        if (this.filter === 'unread') {
            return this.notifications.filter(n => !n.isRead);
        }
        return this.notifications;
    }

    loadNotifications() {
        this.notificationService.getMyNotifications().subscribe({
            next: (data) => {
                this.notifications = data;
            },
            error: (err) => {
                console.error('Error loading notifications:', err);
            }
        });
    }

    onNotificationClick(notification: Notification) {
        if (!notification.isRead) {
            this.markAsRead(notification.id);
        }
    }

    markAsRead(id: number) {
        this.notificationService.markAsRead(id).subscribe(() => {
            // Optimistic update
            const note = this.notifications.find(n => n.id === id);
            if (note) note.isRead = true;
        });
    }

    deleteNotification(id: number) {
        this.notificationService.deleteNotification(id).subscribe(() => {
            this.notifications = this.notifications.filter(n => n.id !== id);
        });
    }

    markAllAsRead() {
        this.notificationService.markAllAsRead().subscribe(() => {
            // Mark all notifications as read optimistically
            this.notifications.forEach(n => n.isRead = true);
        });
    }

    updateMenu(profileLabel: string) {
        this.items = [
            {
                label: profileLabel,
                items: [
                    {
                        label: 'Change Password',
                        icon: 'pi pi-key',
                        routerLink: ['/auth/change-password']
                    },
                    {
                        label: 'Logout',
                        icon: 'pi pi-sign-out',
                        command: () => {
                            this.authService.logout();
                        }
                    }
                ]
            }
        ];
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }
}
