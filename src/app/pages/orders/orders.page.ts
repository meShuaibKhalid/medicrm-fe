import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { OrderService } from '../../core/services/order.service';
import { OrderStatusBadgeComponent } from '../../shared/components/order-status-badge/order-status-badge.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonButton,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonTitle,
    IonToolbar,
    OrderStatusBadgeComponent,
    EmptyStateComponent
  ],
  template: `
    <ion-header class="ion-no-border"
      ><ion-toolbar
        ><ion-title class="header-title">My Orders</ion-title></ion-toolbar
      ></ion-header
    >
    <ion-content>
       <div class="page-shell">
      <ng-container *ngIf="!(orders$ | async)?.length">
        <app-empty-state
          title="No orders found"
          message="You have not placed any orders yet."
          icon="bag-handle-outline"
        ></app-empty-state>
      </ng-container>

      <ng-container *ngIf="(orders$ | async)?.length">
       
          <ion-list class="soft-card">
            <ion-item *ngFor="let order of orders$ | async">
              <ion-label>
                <h2>{{ order.orderNumber }}</h2>
                <p class="date">{{ order.createdAt | date: 'mediumDate' }}</p>
                <p class="amount">
                  Total amount: Rs. {{ order.grandTotal | number: '1.0-2' }}
                </p>

                <app-order-status-badge
                  [status]="order.status"
                ></app-order-status-badge>
              </ion-label>
              <div>
                <button
                  class="action-btn"
                  fill="clear"
                  size="small"
                  [routerLink]="['/orders', order.id]"
                >
                  View Details
                </button>
              </div>
            </ion-item>
          </ion-list>
        </ng-container>
      </div>
    </ion-content>
  `,
  styles: [
    `
      .page-shell {
        max-width: 800px;
        margin: 0 auto;
        padding: 1rem;
      }
      ion-list {
        background: #fff;
        ion-item {
          --background: transparent;
          ion-label {
            // display: ;
            h2 {
              font-size: 15px;
              font-weight: 700;
              color: #2c1a22;
              margin-bottom: 2px;
            }
            .date {
              font-size: 12px;
              color: #a0758c;
              font-family: monospace;
              margin-bottom: 6px;
            }
            .amount {
            }
          }
          .action-btn {
            /* moved shared button styling to src/global.scss */
          }
        }
      }
    `,
  ],
})
export class OrdersPage implements OnInit {
  private readonly orderService = inject(OrderService);
  orders$ = this.orderService.getMyOrders();

  ngOnInit() {
    this.orderService.fetchMyOrders().subscribe();
  }
}
