import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import type { ServiceDetailDto, ItemDto } from '../../../../../proxy/services';
import { ServiceInfoHeaderComponent } from '../service-info-header/service-info-header';
import { ServiceStatsBarComponent } from '../service-stats-bar/service-stats-bar';
import { ServiceItemsTableComponent } from '../service-items-table/service-items-table';

/**
 * Mid-layer component: Service Workspace (right column).
 * Composes the Header, Stats Bar, and Items Table into a single scrollable panel.
 */
@Component({
  selector: 'app-service-workspace',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ServiceInfoHeaderComponent,
    ServiceStatsBarComponent,
    ServiceItemsTableComponent,
  ],
  templateUrl: './service-workspace.html',
})
export class ServiceWorkspaceComponent {
  readonly service = input.required<ServiceDetailDto>();
  readonly items = input<ItemDto[]>([]);
  readonly isLoadingItems = input<boolean>(false);

  readonly statusToggle = output<boolean>();
  readonly editCoreInfo = output<string>();
  readonly addItem = output<void>();
  readonly editItem = output<ItemDto>();
  readonly removeItem = output<ItemDto>();
}