import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../core/services/auth/auth.service';
import { SidebarComponent } from './sidebar/sidebar';
import { NAV_SECTIONS } from './nav-items';

@Component({
  selector: 'app-dashboard-shell',
  imports: [RouterOutlet, SidebarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard-shell.html',
})
export class DashboardShellComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  protected readonly sidebarCollapsed = signal(false);
  protected readonly mobileMenuOpen = signal(false);

  protected readonly pageTitle = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.resolvePageTitle()),
      startWith(this.resolvePageTitle()),
    ),
    { initialValue: 'Overview' },
  );

  protected toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  protected closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  protected logout(): void {
    this.authService.logout();
  }

  private resolvePageTitle(): string {
    const segment = this.router.url.split('/').filter(Boolean).pop() ?? 'overview';
    for (const section of NAV_SECTIONS) {
      const found = section.items.find(item => item.route === segment);
      if (found) return found.label;
    }
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  }
}
