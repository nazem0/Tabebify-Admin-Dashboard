import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import type { AbstractControl } from '@angular/forms';

/**
 * Reusable form field shell.
 *
 * Renders the standard label → control → error-message layout used everywhere
 * in admin forms.  The actual <input> or <select> is either:
 *  • Auto-rendered by passing `type` + `placeholder` (most common)
 *  • Or fully custom via `<ng-content />` (select options, password reveal, etc.)
 *
 * For select fields, use type="select" and project the <option> elements.
 *
 * Example — auto-rendered input:
 *   <app-form-field
 *     label="Email" fieldId="f-email" [control]="form.controls.email"
 *     type="email" placeholder="admin@example.com" [required]="true"
 *     errorMessage="A valid email is required."
 *   />
 *
 * Example — projected select:
 *   <app-form-field label="Gender" fieldId="f-gender" [control]="form.controls.gender" type="select">
 *     <option value="0">Female</option>
 *     <option value="1">Male</option>
 *   </app-form-field>
 */
@Component({
  selector: 'app-form-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div>
      @if (label()) {
        <label
          [for]="fieldId()"
          class="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5"
        >
          {{ label() }}
          @if (required()) {
            <span class="text-error ml-0.5" aria-hidden="true">*</span>
          }
        </label>
      }

      @if (type() === 'select') {
        <!-- Select with projected <option> elements -->
        <div class="relative">
          <select
            [id]="fieldId()"
            [formControl]="$any(control())"
            class="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-body-md focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition appearance-none pr-10 cursor-pointer"
            [class]="hasError() ? 'border-error/50 focus:ring-error/30' : ''"
          >
            <ng-content />
          </select>
          <span
            class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none"
            aria-hidden="true"
          >expand_more</span>
        </div>
      } @else if (type() === 'custom') {
        <!-- Fully custom control — caller projects anything they need -->
        <ng-content />
      } @else {
        <!-- Standard text / email / password / tel / date input -->
        <input
          [id]="fieldId()"
          [type]="type()"
          [formControl]="$any(control())"
          [placeholder]="placeholder()"
          [autocomplete]="autocomplete()"
          class="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-body-md focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
          [class]="hasError() ? 'border-error/50 focus:ring-error/30' : ''"
        />
      }

      @if (hasError()) {
        <p class="text-error text-[11px] mt-1" role="alert">{{ errorMessage() }}</p>
      }
    </div>
  `,
})
export class FormFieldComponent {
  readonly label = input<string>('');
  readonly fieldId = input.required<string>();
  /** Pass the reactive FormControl so the component can read touched/invalid state. */
  readonly control = input.required<AbstractControl>();
  /**
   * "text" | "email" | "password" | "tel" | "date" | "number"
   * "select"  → renders a <select>; project <option> elements
   * "custom"  → skips the rendered control; project your own markup
   */
  readonly type = input<string>('text');
  readonly placeholder = input<string>('');
  readonly autocomplete = input<string>('off');
  readonly required = input<boolean>(false);
  /** Shown only when the control is touched AND invalid. */
  readonly errorMessage = input<string>('');

  protected readonly hasError = computed(
    () => !!this.errorMessage() && this.control().touched && this.control().invalid,
  );
}
