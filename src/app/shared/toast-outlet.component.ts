import { Component } from '@angular/core';
import { ToastService } from '../core/toast.service';

@Component({
  selector: 'app-toast-outlet',
  standalone: true,
  templateUrl: './toast-outlet.component.html',
})
export class ToastOutletComponent {
  constructor(readonly toast: ToastService) {}
}
