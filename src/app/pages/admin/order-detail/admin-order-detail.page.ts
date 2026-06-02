import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonAlert, IonButton, IonCard, IonCardContent, IonContent, IonItem, IonLabel, IonList } from '@ionic/angular/standalone';
import { AdminService } from '../../../core/services/admin.service';
import { Order } from '../../../shared/models/app.models';
import { OrderStatusBadgeComponent } from '../../../shared/components/order-status-badge/order-status-badge.component';

@Component({
  selector: 'app-admin-order-detail',
  standalone: true,
  imports: [CommonModule, IonAlert, IonButton, IonCard, IonCardContent, IonContent, IonItem, IonLabel, IonList, OrderStatusBadgeComponent],
  template: `
    <ion-content *ngIf="order">
      <div class="page-shell">
        <ion-card class="soft-card">
          <ion-card-content>
            <h2>{{ order.orderNumber }}</h2>
            <p><strong>Customer:</strong> {{ order.user?.name || order.address.fullName }}</p>
            <p><strong>Email:</strong> {{ order.user?.email || 'N/A' }}</p>
            <p><strong>Phone:</strong> {{ order.user?.phone || order.address.phone }}</p>
            <p>{{ order.address.fullName }} · {{ order.address.phone }}</p>
            <p>{{ order.address.addressLine }}, {{ order.address.area }}, {{ order.address.city }}</p>
            <p *ngIf="order.address.latitude && order.address.longitude">Lat/Lng: {{ order.address.latitude }}, {{ order.address.longitude }}</p>
            <app-order-status-badge [status]="order.status"></app-order-status-badge>
          </ion-card-content>
        </ion-card>
        <ion-list class="soft-card">
          <ion-item *ngFor="let item of order.items">
            <ion-label>{{ item.title }} · {{ item.quantity }} x Rs. {{ (item.salePrice ?? item.price) | number:'1.0-2' }}</ion-label>
          </ion-item>
        </ion-list>
        <ion-card class="soft-card">
          <ion-card-content>
            <p><strong>Subtotal:</strong> Rs. {{ order.subtotal | number:'1.0-2' }}</p>
            <p><strong>Discount:</strong> Rs. {{ order.discountTotal | number:'1.0-2' }}</p>
            <p><strong>Delivery fee:</strong> Rs. {{ order.deliveryFee | number:'1.0-2' }}</p>
            <p><strong>Total:</strong> Rs. {{ order.grandTotal | number:'1.0-2' }}</p>
            <p><strong>Payment:</strong> {{ order.paymentMethod }}</p>
          </ion-card-content>
        </ion-card>
        <div class="actions">
          <ion-button expand="block" shape="round" color="success" [disabled]="!canComplete" (click)="updateStatus('Done')">Mark Done</ion-button>
          <ion-button expand="block" shape="round" color="danger" fill="outline" [disabled]="!canCancel" (click)="updateStatus('Cancelled')">Cancel Order</ion-button>
        </div>

        <ion-alert
          [isOpen]="isStatusConfirmOpen"
          [header]="confirmHeader"
          [message]="confirmMessage"
          [buttons]="statusConfirmButtons"
          (didDismiss)="closeStatusConfirm()"
        ></ion-alert>
      </div>
    </ion-content>
  `,
  styles: [`
    .page-shell {
      padding-top: 50px;
    }

    .actions {
      display:grid;
      gap:12px;
      margin-top:16px;
    }
  `],
})
export class AdminOrderDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly adminService = inject(AdminService);
  order?: Order;
  isStatusConfirmOpen = false;
  private pendingStatus?: Order['status'];

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id') ?? '';
      this.adminService.getOrders().subscribe((res:any) => {
        this.order = res.items.find((item:any) => item.id === id);
      });
    });
  }

  get canComplete(): boolean {
    return !!this.order && !['Done', 'Cancelled'].includes(this.order.status);
  }

  get canCancel(): boolean {
    return !!this.order && this.order.status !== 'Done' && this.order.status !== 'Cancelled';
  }

  updateStatus(status: Order['status']): void {
    if (!this.order) {
      return;
    }
    this.pendingStatus = status;
    this.isStatusConfirmOpen = true;
  }

  get confirmHeader(): string {
    return this.pendingStatus === 'Done' ? 'Complete Order' : 'Cancel Order';
  }

  get confirmMessage(): string {
    return this.pendingStatus === 'Done'
      ? 'Are you sure you want to mark this order as complete?'
      : 'Are you sure you want to cancel this order?';
  }

  closeStatusConfirm(): void {
    this.isStatusConfirmOpen = false;
    this.pendingStatus = undefined;
  }

  get statusConfirmButtons() {
    return [
      {
        text: 'Back',
        role: 'cancel' as const,
        handler: () => this.closeStatusConfirm(),
      },
      {
        text: 'Confirm',
        handler: () => {
          const status = this.pendingStatus;
          const orderId = this.order?.id;
          this.closeStatusConfirm();
          if (!status || !orderId) return;
          this.adminService.updateOrderStatus(orderId, status).subscribe((updated) => {
            this.order = updated;
          });
        },
      },
    ];
  }
}
