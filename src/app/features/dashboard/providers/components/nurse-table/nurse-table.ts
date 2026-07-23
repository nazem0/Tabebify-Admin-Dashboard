import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { StatusBadgeComponent } from '../../../../../shared/components/status-badge/status-badge';
import { RowActionsMenuComponent, type RowActionItem } from '../../../../../shared/components/row-actions-menu/row-actions-menu';
import { AppInitialsPipe } from '../../../../../shared/pipes/initials.pipe';
import { AppDatePipe } from '../../../../../shared/pipes/app-date.pipe';
import type { AdminProviderListDto } from '../../../../../proxy/admin';

@Component({
  selector: 'app-nurse-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StatusBadgeComponent, RowActionsMenuComponent, AppInitialsPipe, AppDatePipe],
  templateUrl: './nurse-table.html',
})
export class NurseTableComponent {
  readonly nurses = input.required<AdminProviderListDto[]>();
  readonly nurseActiveStates = input<Map<string, boolean>>(new Map());
  readonly togglingUserId = input<string | null>(null);

  readonly viewProfile = output<AdminProviderListDto>();
  readonly editNurse = output<AdminProviderListDto>();
  readonly toggleBlock = output<AdminProviderListDto>();
  readonly viewDocuments = output<AdminProviderListDto>();
  readonly deleteNurse = output<AdminProviderListDto>();

  protected isActive(nurse: AdminProviderListDto) {
    return this.nurseActiveStates().get(nurse.id ?? '') ?? nurse.isAccountActive;
  }

  protected isToggling(nurse: AdminProviderListDto): boolean {
    return this.togglingUserId() === nurse.id;
  }

  protected getStatus(nurse: AdminProviderListDto): number | string {
    return nurse.accountStatus ?? '';
  }

  protected getMenuItems(nurse: AdminProviderListDto): RowActionItem[] {
    const active = this.isActive(nurse);
    return [
      { key: 'documents', label: 'View Documents',                              icon: 'workspace_premium' },
      { key: 'edit',      label: 'Edit Profile',                                icon: 'edit' },
      { key: 'block',     label: active ? 'Block Account' : 'Unblock Account',  icon: active ? 'block' : 'lock_open', colorClass: active ? 'text-error' : 'text-green-700', disabled: this.isToggling(nurse) },
      { key: 'delete',    label: 'Delete Account',                              icon: 'delete_forever', colorClass: 'text-error' },
    ];
  }

  protected onMenuAction(key: string, nurse: AdminProviderListDto): void {
    switch (key) {
      case 'documents': this.viewDocuments.emit(nurse); break;
      case 'edit':      this.editNurse.emit(nurse);     break;
      case 'block':     this.toggleBlock.emit(nurse);   break;
      case 'delete':    this.deleteNurse.emit(nurse);   break;
    }
  }
}
