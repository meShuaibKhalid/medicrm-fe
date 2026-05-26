import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent, IonHeader, IonItem, IonLabel, IonList, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { OrderService } from '../../core/services/order.service';
import { OrderStatusBadgeComponent } from '../../shared/components/order-status-badge/order-status-badge.component';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, IonButton, IonContent, IonHeader, IonItem, IonLabel, IonList, IonTitle, IonToolbar, OrderStatusBadgeComponent],
  template: `
    <ion-header class="ion-no-border"><ion-toolbar><ion-title>My Orders</ion-title></ion-toolbar></ion-header>
    <ion-content>
      <div class="page-shell">
        <ion-list class="soft-card">
          <ion-item *ngFor="let order of orders$ | async">
            <ion-label>
              <h2>{{ order.orderNumber }}</h2>
              <p>{{ order.createdAt | date:'mediumDate' }}</p>
              <p>Total amount: Rs. {{ order.grandTotal | number:'1.0-2' }}</p>
              <app-order-status-badge [status]="order.status"></app-order-status-badge>
              <div><ion-button fill="clear" size="small" [routerLink]="['/orders', order.id]">View Details</ion-button></div>
            </ion-label>
          </ion-item>
        </ion-list>
      </div>
    </ion-content>
  `,
})
export class OrdersPage {
  private readonly orderService = inject(OrderService);
  orders$ = this.orderService.getMyOrders();

  ngOnInit() {
    this.orderService.fetchMyOrders().subscribe();
  }
}
