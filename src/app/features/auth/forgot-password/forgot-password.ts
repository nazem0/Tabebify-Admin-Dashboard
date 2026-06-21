import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-surface flex flex-col items-center justify-center gap-4 p-8">
      <p class="text-xl font-semibold text-primary">Forgot Password</p>
      <p class="text-sm text-on-surface-variant">This feature is coming soon.</p>
      <a routerLink="/auth/login" class="text-sm text-primary font-bold hover:underline">Back to Login</a>
    </div>
  `,
})
export class ForgotPasswordComponent {}
