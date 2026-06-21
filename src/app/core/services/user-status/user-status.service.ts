import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { IdentityUserService } from '../../../proxy/volo/abp/identity';

/**
 * Centralises the get → toggle → update identity user pattern.
 * Replaces the identical nested-subscribe blocks in UsersComponent and ProvidersComponent.
 * Uses switchMap so a rapid second call cancels any in-flight pair.
 */
@Injectable({ providedIn: 'root' })
export class UserStatusService {
  private readonly identity = inject(IdentityUserService);

  /**
   * Fetches the current user DTO, flips isActive, and persists the change.
   * Emits the resulting isActive value on success.
   */
  toggleActive(userId: string): Observable<boolean> {
    return this.identity.get(userId).pipe(
      switchMap(dto => {
        const newActive = !(dto.isActive ?? true);
        return this.identity
          .update(userId, {
            userName: dto.userName ?? '',
            email: dto.email ?? '',
            name: dto.name,
            surname: dto.surname,
            phoneNumber: dto.phoneNumber,
            isActive: newActive,
            lockoutEnabled: dto.lockoutEnabled,
            extraProperties: dto.extraProperties,
            concurrencyStamp: dto.concurrencyStamp,
          })
          .pipe(map(() => newActive));
      }),
    );
  }
}
