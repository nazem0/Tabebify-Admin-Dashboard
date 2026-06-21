import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-surface flex flex-col items-center justify-center gap-4 p-8">
      <p class="text-2xl font-bold text-primary">Dashboard</p>
      <p class="text-sm text-on-surface-variant">Welcome to Tabebify Admin.</p>
      <button
        type="button"
        (click)="logout()"
        class="px-6 py-2 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary/90 transition-all"
      >
        Logout
      </button>
    </div>
  `,
})
export class DashboardComponent {
  private readonly authService = inject(AuthService);
  
  protected logout(): void {
    this.authService.logout();
  }
}
