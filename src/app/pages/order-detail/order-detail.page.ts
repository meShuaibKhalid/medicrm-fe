import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonCard, IonCardContent, IonContent, IonHeader, IonItem, IonLabel, IonList, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { OrderService } from '../../core/services/order.service';
import { Order } from '../../shared/models/app.models';
import { OrderStatusBadgeComponent } from '../../shared/components/order-status-badge/order-status-badge.component';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, IonCard, IonCardContent, IonContent, IonHeader, IonItem, IonLabel, IonList, IonTitle, IonToolbar, OrderStatusBadgeComponent],
  template: `
    <ion-header class="ion-no-border"><ion-toolbar><ion-title>Order Detail</ion-title></ion-toolbar></ion-header>
    <ion-content *ngIf="order">
      <div class="page-shell">
        <ion-card class="soft-card">
          <ion-card-content>
            <h2>{{ order.orderNumber }}</h2>
            <app-order-status-badge [status]="order.status"></app-order-status-badge>
            <p>{{ order.address.fullName }} · {{ order.address.phone }}</p>
            <p>{{ order.address.addressLine }}, {{ order.address.area }}, {{ order.address.city }}</p>
          </ion-card-content>
        </ion-card>
        <ion-list class="soft-card">
          <ion-item *ngFor="let item of order.items">
            <ion-label>
              <h3>{{ item.product.title }}</h3>
              <p>{{ item.quantity }} x Rs. {{ (item.salePrice ?? item.price) | number:'1.0-2' }}</p>
            </ion-label>
          </ion-item>
        </ion-list>
        <ion-card class="soft-card">
          <ion-card-content>
            <p>Subtotal: Rs. {{ order.subtotal | number:'1.0-2' }}</p>
            <p>Discount: Rs. {{ order.discountTotal | number:'1.0-2' }}</p>
            <p>Delivery fee: Rs. {{ order.deliveryFee | number:'1.0-2' }}</p>
            <p><strong>Grand total: Rs. {{ order.grandTotal | number:'1.0-2' }}</strong></p>
            <p>Payment method: {{ order.paymentMethod }}</p>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  `,
})
export class OrderDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly orderService = inject(OrderService);
  order?: Order;

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id') ?? '';
      this.orderService.getOrderById(id).subscribe((order) => this.order = order);
    });
  }
}
