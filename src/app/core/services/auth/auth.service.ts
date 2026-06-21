import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';
import { from, Observable, catchError, map, of, startWith, filter } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import type { LoginResult } from '../../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly oAuthService = inject(OAuthService);
  private readonly router = inject(Router);

  // Reactive signal — reacts to token_received / logout events so any template
  // or guard using isAuthenticated() will update without manual change detection.
  readonly isAuthenticated = toSignal(
    this.oAuthService.events.pipe(
      filter(e => ['token_received', 'logout', 'token_error', 'session_terminated', 'token_expires'].includes(e.type)),
      map(() => this.oAuthService.hasValidAccessToken()),
      startWith(this.oAuthService.hasValidAccessToken()),
    ),
    { initialValue: this.oAuthService.hasValidAccessToken() },
  );

  // Discovery document is loaded once at startup by ABP's provideAbpOAuth().
  // No per-login round-trip needed — call fetchTokenUsingPasswordFlow directly.
  login(username: string, password: string): Observable<LoginResult> {
    return from(this.oAuthService.fetchTokenUsingPasswordFlow(username, password)).pipe(
      map((): LoginResult => ({ success: true })),
      catchError((err: unknown): Observable<LoginResult> => {
        const message =
          err instanceof Error ? err.message : 'Invalid credentials. Please try again.';
        return of({ success: false, error: message });
      }),
    );
  }

  // Navigation is a presentation concern — the caller (component) decides where to go.
  logout(): void {
    this.oAuthService.logOut();
    this.router.navigate(['/auth/login']);
  }
}
