import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { ServiceCategoryDto, ServiceDto } from '../../../../../proxy/services';
import { ServiceAccordionItemComponent } from '../service-accordion-item/service-accordion-item';

@Component({
  selector: 'app-category-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ServiceAccordionItemComponent],
  templateUrl: './category-panel.html',
})
export class CategoryPanelComponent {
  readonly categories = input.required<ServiceCategoryDto[]>();
  readonly expandedCategoryId = input<string | null>(null);
  readonly selectedServiceId = input<string | null>(null);
  
  readonly servicesMap = input.required<Map<string, ServiceDto[]>>();
  readonly loadingCategoryId = input<string | null>(null);

  readonly categoryExpand = output<string>();
  readonly serviceSelect = output<string>();
  readonly createService = output<string>();
  
  readonly createCategory = output<void>();
  readonly editCategory = output<ServiceCategoryDto>();
  readonly deleteCategory = output<ServiceCategoryDto>();
}
