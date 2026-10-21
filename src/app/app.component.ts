import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastOutletComponent } from './shared/toast-outlet.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastOutletComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {}
