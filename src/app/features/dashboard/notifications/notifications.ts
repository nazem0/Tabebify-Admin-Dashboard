import { Component, ChangeDetectionStrategy } from '@angular/core';

// Proxies to use when implementing:
// NotificationService — send push/promotional notifications
// DeviceTokenService — manage device tokens
// NotificationType enum

@Component({
  selector: 'app-notifications',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold text-primary mb-1">Notifications</h2>
      <p class="text-sm text-on-surface-variant">Send push, SMS and promotional notifications.</p>
      <div class="mt-8 rounded-2xl border border-outline-variant/20 bg-white p-8 text-center text-sm text-on-surface-variant">
        Coming soon — under development.
      </div>
    </div>
  `,
})
export class NotificationsComponent {}
