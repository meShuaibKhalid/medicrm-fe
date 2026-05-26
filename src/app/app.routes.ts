import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'splash',
    loadComponent: () => import('./pages/splash/splash.page').then((m) => m.SplashPage),
  },
  {
    path: '',
    loadComponent: () => import('./pages/tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      {
        path: 'home',
        loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'cart',
        loadComponent: () => import('./pages/cart/cart.page').then((m) => m.CartPage),
      },
      {
        path: 'orders',
        loadComponent: () => import('./pages/orders/orders.page').then((m) => m.OrdersPage),
      },
      {
        path: 'wishlist',
        loadComponent: () => import('./pages/wishlist/wishlist.page').then((m) => m.WishlistPage),
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.page').then((m) => m.ProfilePage),
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'categories/:slug/products',
    loadComponent: () => import('./pages/category-products/category-products.page').then((m) => m.CategoryProductsPage),
  },
  {
    path: 'products/:slug',
    loadComponent: () => import('./pages/product-detail/product-detail.page').then((m) => m.ProductDetailPage),
  },
  {
    path: 'checkout',
    loadComponent: () => import('./pages/checkout/checkout.page').then((m) => m.CheckoutPage),
  },
  {
    path: 'order-success',
    loadComponent: () => import('./pages/order-success/order-success.page').then((m) => m.OrderSuccessPage),
  },
  {
    path: 'orders/:id',
    loadComponent: () => import('./pages/order-detail/order-detail.page').then((m) => m.OrderDetailPage),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then((m) => m.RegisterPage),
  },
  {
    path: 'addresses',
    loadComponent: () => import('./pages/addresses/addresses.page').then((m) => m.AddressesPage),
  },
  {
    path: 'admin/login',
    loadComponent: () => import('./pages/admin/login/admin-login.page').then((m) => m.AdminLoginPage),
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/layout/admin-layout.page').then((m) => m.AdminLayoutPage),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/admin/dashboard/admin-dashboard.page').then((m) => m.AdminDashboardPage),
      },
      {
        path: 'products',
        loadComponent: () => import('./pages/admin/products/admin-products.page').then((m) => m.AdminProductsPage),
      },
      {
        path: 'products/new',
        loadComponent: () => import('./pages/admin/product-form/admin-product-form.page').then((m) => m.AdminProductFormPage),
      },
      {
        path: 'products/:id/edit',
        loadComponent: () => import('./pages/admin/product-form/admin-product-form.page').then((m) => m.AdminProductFormPage),
      },
      {
        path: 'categories',
        loadComponent: () => import('./pages/admin/categories/admin-categories.page').then((m) => m.AdminCategoriesPage),
      },
      {
        path: 'orders',
        loadComponent: () => import('./pages/admin/orders/admin-orders.page').then((m) => m.AdminOrdersPage),
      },
      {
        path: 'orders/:id',
        loadComponent: () => import('./pages/admin/order-detail/admin-order-detail.page').then((m) => m.AdminOrderDetailPage),
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/admin/users/admin-users.page').then((m) => m.AdminUsersPage),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
