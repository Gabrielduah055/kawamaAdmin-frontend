import { Component, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './admin-shell.component.html',
})
export class AdminShellComponent {
  readonly mobileOpen = signal(false);
  readonly navigation = [
    { label: 'Overview', path: '/dashboard', icon: 'uil-estate', exact: true },
    { label: 'Products', path: '/products', icon: 'uil-box', exact: false },
    { label: 'Categories', path: '/categories', icon: 'uil-apps', exact: true },
    { label: 'Reviews', path: '/reviews', icon: 'uil-star', exact: true },
  ];

  constructor(
    readonly auth: AuthService,
    private readonly router: Router,
  ) {}

  signOut(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}
