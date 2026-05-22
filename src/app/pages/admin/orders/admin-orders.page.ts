import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent, IonItem, IonLabel, IonList, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { AdminService } from '../../../core/services/admin.service';
import { Order } from '../../../shared/models/app.models';
import { OrderStatusBadgeComponent } from '../../../shared/components/order-status-badge/order-status-badge.component';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IonButton, IonContent, IonItem, IonLabel, IonList, IonSelect, IonSelectOption, OrderStatusBadgeComponent],
  template: `
    <ion-content>
      <div class="page-shell">
        <div class="section-title"><h2>Orders</h2></div>
        <ion-item class="soft-card">
          <ion-label>Status filter</ion-label>
          <ion-select [(ngModel)]="statusFilter">
            <ion-select-option value="">All</ion-select-option>
            <ion-select-option value="pending">Pending</ion-select-option>
            <ion-select-option value="confirmed">Confirmed</ion-select-option>
            <ion-select-option value="dispatched">Dispatched</ion-select-option>
            <ion-select-option value="completed">Completed</ion-select-option>
            <ion-select-option value="cancelled">Cancelled</ion-select-option>
          </ion-select>
        </ion-item>
        <ion-list class="soft-card">
          <ion-item *ngFor="let order of filteredOrders">
            <ion-label>
              <h2>{{ order.orderNumber }}</h2>
              <p>{{ order.user?.name || order.address.fullName }} · Rs. {{ order.grandTotal | number:'1.0-2' }}</p>
              <app-order-status-badge [status]="order.status"></app-order-status-badge>
              <div>
                <ion-button size="small" fill="clear" [routerLink]="['/admin/orders', order.id]">View</ion-button>
              </div>
            </ion-label>
          </ion-item>
        </ion-list>
      </div>
    </ion-content>
  `,
})
export class AdminOrdersPage {
  private readonly adminService = inject(AdminService);
  orders: Order[] = [];
  statusFilter = '';

  constructor() {
    this.adminService.getOrders().subscribe((orders) => this.orders = orders);
  }

  get filteredOrders(): Order[] {
    return this.statusFilter ? this.orders.filter((order) => order.status === this.statusFilter) : this.orders;
  }
}
