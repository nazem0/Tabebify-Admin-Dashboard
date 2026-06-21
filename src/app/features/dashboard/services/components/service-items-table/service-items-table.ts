import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { AppCurrencyPipe } from '../../../../../shared/pipes/currency.pipe';
import { StatusBadgeComponent } from '../../../../../shared/components/status-badge/status-badge';
import { RowActionsMenuComponent, RowActionItem } from '../../../../../shared/components/row-actions-menu/row-actions-menu';
import type { ItemDto } from '../../../../../proxy/services';

@Component({
  selector: 'app-service-items-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppCurrencyPipe, StatusBadgeComponent, RowActionsMenuComponent],
  templateUrl: './service-items-table.html',
})
export class ServiceItemsTableComponent {
  readonly items = input.required<ItemDto[]>();
  readonly isLoading = input<boolean>(false);

  readonly addItem = output<void>();
  readonly editItem = output<ItemDto>();
  readonly removeItem = output<ItemDto>();

  protected readonly menuItems: RowActionItem[] = [
    { key: 'edit', label: 'Edit Item', icon: 'edit' },
    { key: 'remove', label: 'Remove Item', icon: 'delete', colorClass: 'text-error' }
  ];

  protected getIconName(name?: string): string {
    if (!name) return 'receipt_long';
    const n = name.toLowerCase();
    if (n.includes('vaccine') || n.includes('shot')) return 'vaccines';
    if (n.includes('blood') || n.includes('test')) return 'bloodtype';
    if (n.includes('x-ray') || n.includes('scan')) return 'radiology';
    if (n.includes('surgery') || n.includes('operation')) return 'surgical';
    return 'receipt_long';
  }

  protected onMenuAction(key: string, item: ItemDto): void {
    if (key === 'edit') this.editItem.emit(item);
    if (key === 'remove') this.removeItem.emit(item);
  }
}
