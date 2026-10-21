import { CanDeactivateFn } from '@angular/router';

export interface PendingChangesComponent {
  hasPendingChanges(): boolean;
}

export const pendingChangesGuard: CanDeactivateFn<PendingChangesComponent> = (component) =>
  !component.hasPendingChanges() || window.confirm('Leave this page and discard your unsaved changes?');
