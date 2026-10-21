import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { pendingChangesGuard } from './core/pending-changes.guard';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Sign in | Kawama Admin',
    loadComponent: () => import('./features/auth/login.page').then((module) => module.LoginPage),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/admin-shell.component').then((module) => module.AdminShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        title: 'Overview | Kawama Admin',
        loadComponent: () => import('./features/dashboard/dashboard.page').then((module) => module.DashboardPage),
      },
      {
        path: 'orders',
        title: 'Orders | Kawama Admin',
        loadComponent: () => import('./features/orders/orders.page').then((module) => module.OrdersPage),
      },
      {
        path: 'orders/:id',
        title: 'Order details | Kawama Admin',
        loadComponent: () => import('./features/orders/order-detail.page').then((module) => module.OrderDetailPage),
      },
      {
        path: 'customers',
        title: 'Customers | Kawama Admin',
        loadComponent: () => import('./features/customers/customers.page').then((module) => module.CustomersPage),
      },
      {
        path: 'customers/:id',
        title: 'Customer details | Kawama Admin',
        loadComponent: () => import('./features/customers/customer-detail.page').then((module) => module.CustomerDetailPage),
      },
      {
        path: 'products',
        title: 'Products | Kawama Admin',
        loadComponent: () => import('./features/products/products.page').then((module) => module.ProductsPage),
      },
      {
        path: 'products/new',
        title: 'Add product | Kawama Admin',
        canDeactivate: [pendingChangesGuard],
        loadComponent: () => import('./features/products/product-form.page').then((module) => module.ProductFormPage),
      },
      {
        path: 'products/:id/edit',
        title: 'Edit product | Kawama Admin',
        canDeactivate: [pendingChangesGuard],
        loadComponent: () => import('./features/products/product-form.page').then((module) => module.ProductFormPage),
      },
      {
        path: 'categories',
        title: 'Categories | Kawama Admin',
        loadComponent: () => import('./features/categories/categories.page').then((module) => module.CategoriesPage),
      },
      {
        path: 'reviews',
        title: 'Reviews | Kawama Admin',
        loadComponent: () => import('./features/reviews/reviews.page').then((module) => module.ReviewsPage),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
