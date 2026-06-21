import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NAV_SECTIONS } from '../nav-items';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class SidebarComponent {
  readonly isCollapsed = input.required<boolean>();
  readonly collapseToggled = output<void>();

  protected readonly navSections = NAV_SECTIONS;

  protected toggle(): void {
    this.collapseToggled.emit();
  }
}
