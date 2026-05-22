import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonCard, IonCardContent, IonContent, IonHeader, IonIcon, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule, RouterLink, IonButton, IonCard, IonCardContent, IonContent, IonHeader, IonIcon, IonTitle, IonToolbar],
  template: `
    <ion-header class="ion-no-border"><ion-toolbar><ion-title>Order Success</ion-title></ion-toolbar></ion-header>
    <ion-content>
      <div class="page-shell">
        <ion-card class="soft-card success-card" *ngIf="orderService.getLatestOrder() as order">
          <ion-card-content>
            <ion-icon name="checkmark-circle-outline" color="success"></ion-icon>
            <h2>Order Placed Successfully</h2>
            <p>Order number: {{ order.orderNumber }}</p>
            <p>Payment method: {{ order.paymentMethod }}</p>
            <p>Status: Pending</p>
            <ion-button expand="block" shape="round" [routerLink]="['/orders', order.id]">View Order</ion-button>
            <ion-button expand="block" fill="outline" routerLink="/home">Continue Shopping</ion-button>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  `,
  styles: [`.success-card { text-align:center; } ion-icon { font-size: 52px; margin-top: 8px; }`],
})
export class OrderSuccessPage {
  readonly orderService = inject(OrderService);
}
