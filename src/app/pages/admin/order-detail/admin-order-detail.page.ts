import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonIcon,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonAlert,
} from '@ionic/angular/standalone';
import { AdminService } from '../../../core/services/admin.service';
import { Order } from '../../../shared/models/app.models';
import { OrderStatusBadgeComponent } from '../../../shared/components/order-status-badge/order-status-badge.component';

@Component({
  selector: 'app-admin-order-detail',
  standalone: true,
  imports: [
    CommonModule,
    IonButton,
    IonCard,
    IonCardContent,
    IonContent,
    IonItem,
    IonLabel,
    IonList,
    OrderStatusBadgeComponent,
    IonIcon,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonAlert,
  ],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button><</ion-back-button
        ></ion-buttons>
        <ion-title>Order Detail</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="admin-order-content" *ngIf="order">
      <div class="page-shell">
        <ion-card class="soft-card">
          <ion-card-content>
            <p class="section-label">Customer info</p>
            <div class="customer-row">
              <div class="avatar">
                {{
                  order.user?.name || order.address.fullName
                    | slice: 0 : 2
                    | uppercase
                }}
              </div>
              <div>
                <div class="cust-name">
                  {{ order.user?.name || order.address.fullName }}
                </div>
                <div class="cust-meta">
                  {{ order.user?.email || 'N/A' }}<br />
                  {{ order.user?.phone || order.address.phone }}
                </div>
              </div>
            </div>
            <div class="order-meta-row">
              <span class="order-num">{{ order.orderNumber }}</span>
              <app-order-status-badge
                [status]="order.status"
              ></app-order-status-badge>
            </div>
            <hr class="divider" />
            <div class="addr-row">
              <div class="addr-icon">
                <ion-icon name="location-outline"></ion-icon>
              </div>
              <div>
                <p class="addr-text">
                  {{ order.address.fullName }} · {{ order.address.phone }}
                </p>
                <p class="addr-text">
                  {{ order.address.addressLine }}, {{ order.address.area }},
                  {{ order.address.city }}
                </p>
                <span
                  class="coord-pill"
                  *ngIf="order.address.latitude && order.address.longitude"
                >
                  <ion-icon name="location-outline"></ion-icon>
                  {{ order.address.latitude }}, {{ order.address.longitude }}
                </span>
              </div>
            </div>
          </ion-card-content>
        </ion-card>

        <ion-card class="soft-card items-card">
          <ion-card-content
            ><p class="section-label">Order items</p></ion-card-content
          >
          <ion-list lines="none">
            <ion-item *ngFor="let item of order.items" class="item-row">
              <ion-label>
                <h3 class="item-name">{{ item.title }}</h3>
                <p class="item-qty">
                  {{ item.quantity }} × Rs.
                  {{ item.salePrice ?? item.price | number: '1.0-2' }}
                </p>
              </ion-label>
              <p slot="end" class="item-price">
                Rs.
                {{
                  (item.salePrice ?? item.price) * item.quantity
                    | number: '1.0-2'
                }}
              </p>
            </ion-item>
          </ion-list>
        </ion-card>

        <ion-card class="soft-card">
          <ion-card-content>
            <p class="section-label">Payment summary</p>
            <div class="sum-row">
              <span>Subtotal</span
              ><span>Rs. {{ order.subtotal | number: '1.0-2' }}</span>
            </div>
            <div class="sum-row discount">
              <span>Discount</span
              ><span>- Rs. {{ order.discountTotal | number: '1.0-2' }}</span>
            </div>
            <div class="sum-row">
              <span>Delivery fee</span
              ><span>Rs. {{ order.deliveryFee | number: '1.0-2' }}</span>
            </div>
            <div class="sum-row total">
              <span>Grand total</span
              ><span>Rs. {{ order.grandTotal | number: '1.0-2' }}</span>
            </div>
            <div class="pay-row">
              <div class="pay-icon">
                <ion-icon name="card-outline"></ion-icon>
              </div>
              <div>
                <p class="pay-label">Payment method</p>
                <p class="pay-val">{{ order.paymentMethod }}</p>
              </div>
            </div>
          </ion-card-content>
        </ion-card>

        <div class="actions">
          <ion-button
            expand="block"
            shape="round"
            color="success"
            [disabled]="!canComplete"
            (click)="updateStatus('Done')"
          >
            ✓ Mark as Done
          </ion-button>
          <ion-button
            expand="block"
            shape="round"
            color="danger"
            fill="outline"
            [disabled]="!canCancel"
            (click)="updateStatus('Cancelled')"
          >
            ✕ Cancel Order
          </ion-button>
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
  styles: [
    `
      .page-shell {
        padding-top: 50px;
      }

      .actions {
        display: grid;
        gap: 12px;
        margin-top: 16px;
      }
      ion-toolbar {
        --background: transparent;
        --color: #0d1b2a;
        ion-title {
          font-weight: 700;
        }
        ion-back-button {
          --color: #0d1b2a;
        }
      }

      .admin-order-content {
        --background: linear-gradient(
          145deg,
          #e8f8f2 0%,
          #eaf4fb 40%,
          #ddeaf8 100%
        );
      }

      .page-shell {
        margin: 0 auto;
        padding: 20px 16px 32px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .soft-card {
        border-radius: 20px;
        box-shadow: 0 2px 16px rgba(16, 185, 129, 0.07);
        margin: 0;
        border: none;
      }

      .section-label {
        font-size: 11px;
        font-weight: 700;
        color: #10b981;
        letter-spacing: 0.8px;
        text-transform: uppercase;
        margin-bottom: 14px;
      }

      .customer-row {
        display: flex;
        align-items: flex-start;
        gap: 14px;
        margin-bottom: 14px;
      }
      .avatar {
        width: 48px;
        height: 48px;
        border-radius: 14px;
        flex-shrink: 0;
        background: linear-gradient(135deg, #10b981, #3b82f6);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        font-weight: 700;
        color: #fff;
      }
      .cust-name {
        font-size: 16px;
        font-weight: 700;
        color: #0d1b2a;
        margin-bottom: 2px;
      }
      .cust-meta {
        font-size: 13px;
        color: #64748b;
        line-height: 1.6;
      }

      .order-meta-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 14px;
      }
      .order-num {
        font-size: 15px;
        font-weight: 700;
        color: #0d1b2a;
      }

      .divider {
        border: none;
        border-top: 1px solid #f0f9f5;
        margin: 0 0 14px;
      }
      .addr-row {
        display: flex;
        align-items: flex-start;
        gap: 10px;
      }
      .addr-icon {
        width: 34px;
        height: 34px;
        border-radius: 10px;
        background: #f0f9f5;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        ion-icon {
          color: #10b981;
          font-size: 16px;
        }
      }
      .addr-text {
        font-size: 13px;
        color: #64748b;
        line-height: 1.6;
      }
      .coord-pill {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        background: #f0f9f5;
        border-radius: 20px;
        padding: 3px 10px;
        font-size: 11px;
        color: #10b981;
        font-weight: 600;
        margin-top: 6px;
        ion-icon {
          font-size: 11px;
        }
      }

      .items-card ion-card-content {
        padding-bottom: 4px;
      }
      .item-row {
        --border-color: #f0f9f5;
        .item-name {
          font-size: 14px;
          font-weight: 600;
          color: #0d1b2a;
        }
        .item-qty {
          font-size: 12px;
          color: #64748b;
        }
        .item-price {
          font-size: 14px;
          font-weight: 700;
          color: #10b981;
        }
      }

      .sum-row {
        display: flex;
        justify-content: space-between;
        padding: 6px 0;
        font-size: 13px;
        color: #64748b;
        span:last-child {
          color: #0d1b2a;
          font-weight: 500;
        }
        &.discount span:last-child {
          color: #10b981;
        }
        &.total {
          border-top: 1px solid #f0f9f5;
          margin-top: 8px;
          padding-top: 12px;
          span:first-child {
            font-size: 15px;
            font-weight: 700;
            color: #0d1b2a;
          }
          span:last-child {
            font-size: 15px;
            font-weight: 700;
            color: #10b981;
          }
        }
      }
      .pay-row {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: 14px;
        padding-top: 14px;
        border-top: 1px solid #f0f9f5;
        .pay-icon {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: #f0f9f5;
          display: flex;
          align-items: center;
          justify-content: center;
          ion-icon {
            color: #10b981;
            font-size: 16px;
          }
        }
        .pay-label {
          font-size: 11px;
          color: #64748b;
        }
        .pay-val {
          font-size: 13px;
          font-weight: 600;
          color: #0d1b2a;
        }
      }

      .actions {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      ion-button[color='success'] {
        --background: #10b981;
        --border-radius: 50px;
        height: 52px;
        font-weight: 700;
      }
      ion-button[color='danger'][fill='outline'] {
        --color: #ef4444;
        --border-color: #ef4444;
        --border-radius: 50px;
        height: 52px;
        font-weight: 700;
      }
      ion-list {
        background: transparent;
      }
      @media (min-width: 768px) {
        ion-back-button {
          position: static !important;
        }
      }
    `,
  ],
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
      this.adminService.getOrders().subscribe((res: any) => {
        this.order = res.items.find((item: any) => item.id === id);
      });
    });
  }

  get canComplete(): boolean {
    return !!this.order && !['Done', 'Cancelled'].includes(this.order.status);
  }

  get canCancel(): boolean {
    return (
      !!this.order &&
      this.order.status !== 'Done' &&
      this.order.status !== 'Cancelled'
    );
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
          this.adminService
            .updateOrderStatus(orderId, status)
            .subscribe((updated) => {
              this.order = updated;
            });
        },
      },
    ];
  }
}
