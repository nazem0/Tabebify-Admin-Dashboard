import { Component, ChangeDetectionStrategy, signal, inject, DestroyRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LogoComponent } from '../../../shared/ui/logo/logo';
import { FormInputComponent } from '../../../shared/ui/form-input/form-input';
import { SpinnerButtonComponent } from '../../../shared/ui/spinner-button/spinner-button';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ConfigStateService } from '@abp/ng.core';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    LogoComponent,
    FormInputComponent,
    SpinnerButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.html',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly configStateService = inject(ConfigStateService);

  protected readonly form = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false],
  });

  protected readonly controls = this.form.controls;
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.isLoading.set(true);

    const { username, password } = this.form.getRawValue();

    this.authService
      .login(username ?? '', password ?? '')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => {
          if (result.success) {
            // Refresh ABP config state (permissions, settings) after token is received.
            this.configStateService.refreshAppState().subscribe(() => {
              this.isLoading.set(false);
              this.router.navigate(['/dashboard']);
            });
          } else {
            this.isLoading.set(false);
            this.errorMessage.set(result.error ?? 'Login failed. Please try again.');
          }
        },
        error: () => {
          this.isLoading.set(false);
          this.errorMessage.set('An unexpected error occurred. Please try again.');
        },
      });
  }
}
