import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { toast } from 'ngx-sonner';

interface AbpError {
  message?: string;
  details?: string;
  validationErrors?: Array<{ message?: string; members?: string[] }>;
}

export const abpErrorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse) {
        showToast(err);
      }
      return throwError(() => err);
    }),
  );

function showToast(err: HttpErrorResponse): void {
  // Let OAuth / routing handle 401 silently
  if (err.status === 401) return;

  const abpErr = (err.error as { error?: AbpError } | null)?.error;

  if (abpErr?.validationErrors?.length) {
    const desc = abpErr.validationErrors
      .map(e => e.message)
      .filter(Boolean)
      .join('\n');
    toast.error('Validation failed', { description: desc });
    return;
  }

  const message = abpErr?.message ?? fallbackMessage(err.status);
  const opts = abpErr?.details ? { description: abpErr.details } : undefined;

  if (err.status === 403) {
    toast.warning(message, opts);
  } else {
    toast.error(message, opts);
  }
}

function fallbackMessage(status: number): string {
  const map: Record<number, string> = {
    400: 'Invalid request.',
    403: 'You do not have permission to perform this action.',
    404: 'The requested resource was not found.',
    409: 'Conflict — the resource has active dependencies.',
    500: 'An unexpected server error occurred.',
  };
  return map[status] ?? 'Something went wrong. Please try again.';
}
