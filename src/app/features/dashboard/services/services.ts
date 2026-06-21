import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  DestroyRef,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, switchMap } from 'rxjs/operators';
import { toast } from 'ngx-sonner';

import {
  ServiceCategoryService,
  ServiceService,
  ItemService,
  ServiceCategoryDto,
  ServiceDto,
  ServiceDetailDto,
  ItemDto,
  CreateServiceCategoryDto,
  CreateServiceDto,
} from '../../../proxy/services';

import { CategoryPanelComponent } from './components/category-panel/category-panel';
import { ServiceWorkspaceComponent } from './components/service-workspace/service-workspace';
import { AddItemModalComponent } from './components/add-item-modal/add-item-modal';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal';
import { CategoryModalComponent } from './components/category-modal/category-modal';
import { ServiceModalComponent } from './components/service-modal/service-modal';

@Component({
  selector: 'app-service-management',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CategoryPanelComponent,
    ServiceWorkspaceComponent,
    AddItemModalComponent,
    ConfirmationModalComponent,
    CategoryModalComponent,
    ServiceModalComponent,
  ],
  templateUrl: './services.html',
})
export class ServicesComponent implements OnInit {
  private readonly categoryService = inject(ServiceCategoryService);
  private readonly serviceProxy = inject(ServiceService);
  private readonly itemService = inject(ItemService);
  private readonly destroyRef = inject(DestroyRef);

  // ── States ──
  readonly categories = signal<ServiceCategoryDto[]>([]);
  readonly expandedCategoryId = signal<string | null>(null);
  readonly servicesMap = signal<Map<string, ServiceDto[]>>(new Map());
  readonly loadingCategoryId = signal<string | null>(null);

  readonly selectedServiceId = signal<string | null>(null);
  readonly selectedServiceDetails = signal<ServiceDetailDto | null>(null);
  readonly isLoadingDetails = signal<boolean>(false);

  readonly serviceItems = signal<ItemDto[]>([]);
  readonly isLoadingItems = signal<boolean>(false);
  readonly itemToResponseLookup = signal<ItemDto[]>([]);

  // ── Modals State: Services ──
  readonly showServiceModal = signal<boolean>(false);
  readonly editServiceTarget = signal<any | null>(null);
  readonly isSubmittingService = signal<boolean>(false);
  readonly deleteServiceTarget = signal<ServiceDto | null>(null);
  readonly isDeletingService = signal<boolean>(false);
  private activeContextCategoryId: string | null = null;

  // ── Modals State: Items & Categories ──
  readonly showAddItemModal = signal<boolean>(false);
  readonly isSubmittingItem = signal<boolean>(false);
  readonly editItemTarget = signal<ItemDto | null>(null);
  readonly removeItemTarget = signal<ItemDto | null>(null);
  readonly isRemovingItem = signal<boolean>(false);
  readonly showCategoryModal = signal<boolean>(false);
  readonly editCategoryTarget = signal<ServiceCategoryDto | null>(null);
  readonly isSubmittingCategory = signal<boolean>(false);
  readonly deleteCategoryTarget = signal<ServiceCategoryDto | null>(null);
  readonly isDeletingCategory = signal<boolean>(false);

  ngOnInit(): void {
    this.loadCategories();
    this.loadItemsDictionary();
  }

  private loadItemsDictionary(): void {
    this.itemService
      .getList()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => this.itemToResponseLookup.set(result.items ?? []),
        error: () => toast.error('Failed to load global items dictionary.'),
      });
  }

  private loadCategories(): void {
    this.categoryService
      .getList()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => this.categories.set(result.items ?? []),
        error: () => toast.error('Failed to load categories.'),
      });
  }

  onCategoryExpand(categoryId: string): void {
    const currentExpanded = this.expandedCategoryId();
    if (currentExpanded === categoryId) {
      this.expandedCategoryId.set(null);
      return;
    }
    this.expandedCategoryId.set(categoryId);
    this.refreshServicesForCategory(categoryId);
  }

  private refreshServicesForCategory(categoryId: string): void {
    this.loadingCategoryId.set(categoryId);
    this.serviceProxy
      .getList({ categoryId, maxResultCount: 100 })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loadingCategoryId.set(null)),
      )
      .subscribe({
        next: (result) => {
          this.servicesMap.update((map) => {
            const newMap = new Map(map);
            newMap.set(categoryId, result.items ?? []);
            return newMap;
          });
        },
        error: () => toast.error('Failed to load services.'),
      });
  }

  openServiceModal(service?: any, categoryId?: string): void {
    this.activeContextCategoryId = categoryId ?? this.expandedCategoryId();
    this.editServiceTarget.set(service ?? null);
    this.showServiceModal.set(true);
  }

  closeServiceModal(): void {
    this.showServiceModal.set(false);
    this.editServiceTarget.set(null);
  }

  onEditCoreInfo(): void {
    const currentDetails = this.selectedServiceDetails();
    if (currentDetails) {
      this.openServiceModal(currentDetails);
    }
  }

  onServiceSubmit(payload: any): void {
    if (this.isSubmittingService()) return;
    this.isSubmittingService.set(true);

    const target = this.editServiceTarget();
    const categoryId = target?.serviceCategoryId ?? this.activeContextCategoryId;

    const dto: CreateServiceDto = {
      name: payload.name,
      price: payload.price,
      durationMinutes: payload.durationMinutes,
      isActive: payload.isVerified ?? true,
      categoryId: categoryId,
    };

    const req$ = target?.id
      ? this.serviceProxy.update(target.id, dto)
      : this.serviceProxy.create(dto);

    req$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSubmittingService.set(false)),
      )
      .subscribe({
        next: (res) => {
          toast.success(`Service ${target ? 'updated' : 'created'} successfully.`);
          if (categoryId) {
            this.refreshServicesForCategory(categoryId);
          }
          if (target && this.selectedServiceId() === target.id) {
            this.onServiceSelected(target.id);
          }
          this.closeServiceModal();
        },
        error: () => toast.error('Failed to save service.'),
      });
  }

  openDeleteServiceModal(service: any): void {
    this.deleteServiceTarget.set(service);
  }

  closeDeleteServiceModal(): void {
    this.deleteServiceTarget.set(null);
  }

  confirmDeleteService(): void {
    const target = this.deleteServiceTarget();
    if (!target?.id || this.isDeletingService()) return;

    this.isDeletingService.set(true);
    this.serviceProxy
      .delete(target.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isDeletingService.set(false)),
      )
      .subscribe({
        next: () => {
          toast.success('Service deleted successfully.');
          const catId = target.categoryId ?? this.expandedCategoryId();
          if (catId) this.refreshServicesForCategory(catId);
          if (this.selectedServiceId() === target.id) {
            this.selectedServiceId.set(null);
            this.selectedServiceDetails.set(null);
            this.serviceItems.set([]);
          }
          this.closeDeleteServiceModal();
        },
        error: () => toast.error('Failed to delete service.'),
      });
  }

  onServiceSelected(serviceId: string): void {
    if(this.selectedServiceId() != serviceId){

      this.selectedServiceId.set(serviceId);
      this.isLoadingDetails.set(true);
  
      this.serviceProxy
        .get(serviceId)
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          finalize(() => this.isLoadingDetails.set(false)),
        )
        .subscribe({
          next: (data) => {
            console.log(data);
            this.selectedServiceDetails.set(data);
            this.serviceItems.set(this.selectedServiceDetails()?.availableItems ?? []);
          },
          error: () => toast.error('Failed to load service details.'),
        });
    }
  }

  private loadServiceItems(serviceId: string): void {
    this.isLoadingItems.set(true);
    this.serviceProxy
      .getItems(serviceId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoadingItems.set(false)),
      )
      .subscribe({
        next: (result) => {
          this.serviceItems.set(result.items ?? []);
        },
        error: () => toast.error('Failed to load service items.'),
      });
  }

  onStatusToggle(newStatus: boolean): void {
    const current = this.selectedServiceDetails();
    if (!current || !current.id) return;

    const updatedDto: CreateServiceDto = {
      name: current.name!,
      price: current.price,
      durationMinutes: current.durationMinutes,
      isActive: newStatus,
      categoryId: current.categoryId!,
    };

    this.serviceProxy
      .update(current.id, updatedDto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.selectedServiceDetails.set({ ...current, isVerified: newStatus });
          toast.success(`Service status updated to ${newStatus ? 'Active' : 'Inactive'}.`);
          if (current.categoryId) {
            this.refreshServicesForCategory(current.categoryId);
          }
        },
        error: () => toast.error('Failed to update service status.'),
      });
  }

  // ── Category CRUD Stubs ──
  openCategoryModal(category?: ServiceCategoryDto): void {
    this.editCategoryTarget.set(category ?? null);
    this.showCategoryModal.set(true);
  }

  closeCategoryModal(): void {
    this.showCategoryModal.set(false);
    this.editCategoryTarget.set(null);
  }

  onCategorySubmit(payload: CreateServiceCategoryDto): void {
    if (this.isSubmittingCategory()) return;
    this.isSubmittingCategory.set(true);

    const target = this.editCategoryTarget();
    const req$ = target?.id
      ? this.categoryService.update(target.id, payload)
      : this.categoryService.create(payload);

    req$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSubmittingCategory.set(false)),
      )
      .subscribe({
        next: (res) => {
          toast.success(`Category ${target ? 'updated' : 'created'} successfully.`);
          this.loadCategories();
          this.closeCategoryModal();
        },
        error: () => toast.error('Failed to save category.'),
      });
  }

  openDeleteCategoryModal(category: ServiceCategoryDto): void {
    this.deleteCategoryTarget.set(category);
  }

  closeDeleteCategoryModal(): void {
    this.deleteCategoryTarget.set(null);
  }

  confirmDeleteCategory(): void {
    const target = this.deleteCategoryTarget();
    if (!target?.id || this.isDeletingCategory()) return;

    this.isDeletingCategory.set(true);
    this.categoryService
      .delete(target.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isDeletingCategory.set(false)),
      )
      .subscribe({
        next: () => {
          this.categories.update((list) => list.filter((c) => c.id !== target.id));
          toast.success(`Category deleted.`);
          this.closeDeleteCategoryModal();
        },
        error: () => toast.error('Failed to delete category.'),
      });
  }

  // ── Items CRUD Triggers ──
  openAddItemModal(): void {
    this.editItemTarget.set(null);
    this.showAddItemModal.set(true);
  }

  openEditItemModal(item: ItemDto): void {
    this.editItemTarget.set(item);
    this.showAddItemModal.set(true);
  }

  closeAddItemModal(): void {
    this.showAddItemModal.set(false);
    this.editItemTarget.set(null);
  }

  onAddItemSubmit(event: any): void {
    const serviceId = this.selectedServiceId();
    if (!serviceId || this.isSubmittingItem()) return;
    this.isSubmittingItem.set(true);

    if (event.mode === 'edit') {
      const target = this.editItemTarget();
      if (!target?.id) return;

      this.itemService
        .update(target.id, {
          name: event.name!,
          defaultPrice: event.defaultPrice!,
          isActive: event.isActive ?? true,
        })
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          finalize(() => this.isSubmittingItem.set(false)),
        )
        .subscribe({
          next: () => {
            toast.success(`Global dictionary item updated successfully.`);
            this.closeAddItemModal();
            this.loadServiceItems(serviceId);
          },
          error: () => toast.error('Failed to update item.'),
        });
      return;
    }

    const linkOp$ = (itemId: string) => {
      return this.serviceProxy.addItemToService(serviceId, {
        serviceId,
        itemId: itemId,
        quantity: event.quantity ?? 1,
      });
    };

    if (event.mode === 'new') {
      this.itemService
        .create({
          name: event.name!,
          defaultPrice: event.defaultPrice!,
          isActive: event.isActive ?? true,
        })
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          switchMap((newItem) => {
            this.itemToResponseLookup.update((list) => [...list, newItem]);
            return linkOp$(newItem.id!);
          }),
          finalize(() => this.isSubmittingItem.set(false)),
        )
        .subscribe({
          next: () => {
            toast.success(`New item created and linked to this service.`);
            this.loadServiceItems(serviceId);
            this.closeAddItemModal();
          },
          error: () => toast.error('Failed to create and link item.'),
        });
    } else {
      linkOp$(event.itemId!)
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          finalize(() => this.isSubmittingItem.set(false)),
        )
        .subscribe({
          next: () => {
            toast.success('Item linked to service successfully.');
            this.loadServiceItems(serviceId);
            this.closeAddItemModal();
          },
          error: (err) => toast.error(err.error?.message || 'Failed to link item.'),
        });
    }
  }

  openRemoveItemModal(item: ItemDto): void {
    this.removeItemTarget.set(item);
  }

  closeRemoveItemModal(): void {
    this.removeItemTarget.set(null);
  }

  confirmRemoveItem(): void {
    const target = this.removeItemTarget();
    const serviceId = this.selectedServiceId();
    if (!target?.id || !serviceId || this.isRemovingItem()) return;

    this.isRemovingItem.set(true);

    this.serviceProxy
      .removeItemFromService(serviceId, target.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isRemovingItem.set(false)),
      )
      .subscribe({
        next: () => {
          this.serviceItems.update((items) => items.filter((i) => i.id !== target.id));
          toast.success(`${target.name} removed from service.`);
          this.closeRemoveItemModal();
        },
        error: () => toast.error('Failed to remove item from service.'),
      });
  }
}
