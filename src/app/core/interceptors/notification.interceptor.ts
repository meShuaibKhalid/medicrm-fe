import { HttpErrorResponse, HttpEvent, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap, catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

export const notificationInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    tap((event: HttpEvent<any>) => {
      if (event instanceof HttpResponse) {
        const method = req.method;
        const url = req.url;

        // Check if response contains a standard error payload that was returned as 200 OK (common in some backends)
        if (event.body && event.body.success === false) {
          toastService.error(event.body.message || 'Action failed.');
          return;
        }

        // Only show success messages for write requests (POST, PUT, PATCH, DELETE)
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
          const successMessage = getSuccessMessage(method, url, event.body);
          if (successMessage) {
            toastService.success(successMessage);
          }
        }
      }
    }),
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred';
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      toastService.error(errorMessage);
      return throwError(() => error);
    })
  );
};

function getSuccessMessage(method: string, url: string, responseBody: any): string | null {
  // If the backend returns a specific descriptive message (other than standard 'Done'/'Success'), use it
  if (
    responseBody &&
    responseBody.success &&
    responseBody.message &&
    responseBody.message !== 'Done' &&
    responseBody.message !== 'Success'
  ) {
    return responseBody.message;
  }

  // Endpoint path and method mappings
  if (url.includes('/auth/login')) {
    return 'Logged in successfully.';
  }
  if (url.includes('/auth/register')) {
    return 'Account registered successfully.';
  }
  if (url.includes('/admin/products') || url.includes('/products')) {
    if (method === 'POST') return 'Product created successfully.';
    if (method === 'PATCH' || method === 'PUT') return 'Product updated successfully.';
    if (method === 'DELETE') return 'Product deleted successfully.';
  }
  if (url.includes('/admin/categories') || url.includes('/categories')) {
    if (method === 'POST') return 'Category created successfully.';
    if (method === 'PATCH' || method === 'PUT') return 'Category updated successfully.';
    if (method === 'DELETE') return 'Category deleted successfully.';
  }
  if (url.includes('/admin/users') || url.includes('/users')) {
    if (method === 'PATCH' || method === 'PUT') return 'User status updated successfully.';
    if (method === 'DELETE') return 'User deleted successfully.';
  }
  if (url.includes('/admin/orders') || url.includes('/orders')) {
    if (method === 'POST') return 'Order placed successfully!';
    if (method === 'PATCH' || method === 'PUT') return 'Order status updated successfully.';
  }
  if (url.includes('/addresses')) {
    if (method === 'POST') return 'Address added successfully.';
    if (method === 'PATCH' || method === 'PUT') return 'Address updated successfully.';
    if (method === 'DELETE') return 'Address deleted successfully.';
  }
  if (url.includes('/cart')) {
    if (method === 'POST') return 'Item added to cart.';
    if (method === 'PATCH' || method === 'PUT') return 'Cart updated successfully.';
    if (method === 'DELETE') return 'Item removed from cart.';
  }

  // Fallbacks for any unspecified mutations
  if (method === 'POST') return 'Action completed successfully.';
  if (method === 'PATCH' || method === 'PUT') return 'Changes saved successfully.';
  if (method === 'DELETE') return 'Item deleted successfully.';

  return null;
}
