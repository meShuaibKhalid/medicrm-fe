import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent, IonItem, IonLabel, IonSelect, IonSelectOption, IonSearchbar } from '@ionic/angular/standalone';
import { AdminService } from '../../../core/services/admin.service';
import { Order } from '../../../shared/models/app.models';
import { OrderStatusBadgeComponent } from '../../../shared/components/order-status-badge/order-status-badge.component';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IonButton, IonContent, IonItem, IonLabel, IonSelect, IonSelectOption, IonSearchbar, OrderStatusBadgeComponent],
  template: `
    <ion-content>
      <div class="page-shell">
        <div class="section-title"><h2>Orders</h2></div>
        
        <div class="modal-grid-2" style="margin-bottom: 12px; align-items: center;">
          <ion-item class="soft-card">
            <ion-label>Status filter</ion-label>
            <ion-select [(ngModel)]="statusFilter" (ngModelChange)="page = 1; load()">
              <ion-select-option value="">All</ion-select-option>
              <ion-select-option value="Pending">Pending</ion-select-option>
              <ion-select-option value="Done">Done</ion-select-option>
              <ion-select-option value="Cancelled">Cancelled</ion-select-option>
            </ion-select>
          </ion-item>
          <ion-searchbar placeholder="Search order number or customer" [(ngModel)]="search" (ionInput)="page = 1; load()"></ion-searchbar>
        </div>
        
        <div class="admin-table-wrapper">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let order of orders">
                <td><strong>{{ order.orderNumber }}</strong></td>
                <td>{{ order.user?.name || order.address.fullName }}</td>
                <td>Rs. {{ order.grandTotal | number:'1.0-2' }}</td>
                <td>
                  <app-order-status-badge [status]="order.status"></app-order-status-badge>
                </td>
                <td class="actions-cell">
                  <ion-button size="small" fill="outline" [routerLink]="['/admin/orders', order.id]">
                    View
                  </ion-button>
                </td>
              </tr>
              <tr *ngIf="orders.length === 0">
                <td colspan="5" style="text-align: center; color: #68818d;">No orders found.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination-controls" *ngIf="totalPages > 1">
          <ion-button size="small" fill="outline" [disabled]="page === 1" (click)="goToPage(page - 1)">Previous</ion-button>
          <span>Page {{ page }} of {{ totalPages }} (Total: {{ totalItems }})</span>
          <ion-button size="small" fill="outline" [disabled]="page === totalPages" (click)="goToPage(page + 1)">Next</ion-button>
        </div>
      </div>
    </ion-content>
  `,
})
export class AdminOrdersPage {
  private readonly adminService = inject(AdminService);
  orders: Order[] = [];
  statusFilter = '';
  search = '';

  page = 1;
  limit = 10;
  totalItems = 0;
  totalPages = 1;

  constructor() {
    this.load();
  }

  load(): void {
    this.adminService.getOrders({
      search: this.search,
      status: this.statusFilter,
      page: this.page,
      limit: this.limit
    }).subscribe((res) => {
      this.orders = res.items;
      this.totalItems = res.pagination.total;
      this.totalPages = res.pagination.totalPages;
    });
  }

  goToPage(p: number): void {
    this.page = p;
    this.load();
  }
}
