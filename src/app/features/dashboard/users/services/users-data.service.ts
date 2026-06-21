import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

import { AdminDashboardService } from '../../../../proxy/admin';
import type { AdminPatientFilterInput } from '../../../../proxy/dtos/patients';
import type { UserDisplayDto } from '../models/user-display.dto';

export interface UsersPage {
  items: UserDisplayDto[];
  totalCount: number;
}

@Injectable({ providedIn: 'root' })
export class UsersDataService {
  private readonly adminService = inject(AdminDashboardService);

  getPatients(input: AdminPatientFilterInput): Observable<UsersPage> {
    return this.adminService.getPatients(input).pipe(
      map(result => ({
        items: (result.items ?? []) as UserDisplayDto[],
        totalCount: result.totalCount ?? 0,
      })),
      catchError((err: unknown) => {
        const status = err instanceof HttpErrorResponse ? err.status : 0;
        if (status !== 0) throw err; 
        
        return of({ items: [], totalCount: 0 });
      }),
    );
  }

  getBookings(userId: string): Observable<any[]> {
    return of([]);
  }

  getPayments(userId: string): Observable<any[]> {
    return of([]);
  }
}