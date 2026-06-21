import { Component, ChangeDetectionStrategy, input, signal, computed } from '@angular/core';
import { AbstractControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-input',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './form-input.html',
})
export class FormInputComponent {
  readonly icon = input.required<string>();
  readonly placeholder = input.required<string>();
  readonly type = input<'text' | 'email' | 'password'>('text');
  readonly control = input.required<AbstractControl>();
  readonly inputId = input.required<string>();
  readonly autocomplete = input<string>('off');

  protected readonly showPassword = signal(false);
  protected readonly isPassword = computed(() => this.type() === 'password');
  protected readonly effectiveType = computed(() =>
    this.isPassword() && this.showPassword() ? 'text' : this.type()
  );

  protected togglePassword(): void {
    this.showPassword.update(v => !v);
  }
}
