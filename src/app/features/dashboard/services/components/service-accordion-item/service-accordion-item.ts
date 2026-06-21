import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import type { ServiceCategoryDto, ServiceDto } from '../../../../../proxy/services';
import { RowActionsMenuComponent, RowActionItem } from '../../../../../shared/components/row-actions-menu/row-actions-menu';

@Component({
  selector: 'app-service-accordion-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RowActionsMenuComponent],
  templateUrl: './service-accordion-item.html',
})
export class ServiceAccordionItemComponent {
  readonly category = input.required<ServiceCategoryDto>();
  readonly isExpanded = input<boolean>(false);
  readonly isLoadingServices = input<boolean>(false);
  readonly services = input<ServiceDto[]>([]);
  readonly selectedServiceId = input<string | null>(null);

  readonly expand = output<string>();
  readonly serviceSelect = output<string>();
  readonly editCategory = output<ServiceCategoryDto>();
  readonly deleteCategory = output<ServiceCategoryDto>();
  
  readonly createService = output<string>(); 

  protected panelId = () => `cat-panel-${this.category().id}`;

  protected readonly menuItems: RowActionItem[] = [
    { key: 'add-service', label: 'Add Service', icon: 'add_circle', colorClass: 'text-accent-teal' },
    { key: 'edit', label: 'Edit Category', icon: 'edit' },
    { key: 'delete', label: 'Delete Category', icon: 'delete', colorClass: 'text-error' }
  ];

  protected onMenuAction(key: string): void {
    if (key === 'add-service') this.createService.emit(this.category().id!);
    if (key === 'edit') this.editCategory.emit(this.category());
    if (key === 'delete') this.deleteCategory.emit(this.category());
  }
}