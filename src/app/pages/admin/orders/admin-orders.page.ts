import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonSearchbar,
} from '@ionic/angular/standalone';
import { AdminService } from '../../../core/services/admin.service';
import { Order } from '../../../shared/models/app.models';
import { OrderStatusBadgeComponent } from '../../../shared/components/order-status-badge/order-status-badge.component';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonButton,
    IonContent,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonSearchbar,
    OrderStatusBadgeComponent,
  ],
  template: `
    <ion-content>
      <div class="page-shell">
        <div class="top-bar">
          <h2 class="page-heading">Orders</h2>
        </div>

        <div class="modal-grid-2">
          <ion-searchbar
            class="theme-search"
            placeholder="Search order number or customer"
            [(ngModel)]="search"
            (ionInput)="page = 1; load()"
          ></ion-searchbar>
          <ion-item class="theme-search">
            <ion-label>Status filter</ion-label>
            <ion-select
              [(ngModel)]="statusFilter"
              (ngModelChange)="page = 1; load()"
            >
              <ion-select-option value="">All</ion-select-option>
              <ion-select-option value="Pending">Pending</ion-select-option>
              <ion-select-option value="Done">Done</ion-select-option>
              <ion-select-option value="Cancelled">Cancelled</ion-select-option>
            </ion-select>
          </ion-item>
        </div>
        <span class="section-label"> ALL ORDERS </span>

        <div class="cat-card" *ngFor="let order of orders">
          <div class="cat-body">
            <div class="cat-name">
              <span>
                {{ order.orderNumber }}
              </span>
              <span class="badge">
                <app-order-status-badge
                  [status]="order.status"
                ></app-order-status-badge>
              </span>
            </div>
            <div class="cat-slug">
              {{ order.user?.name || order.address.fullName }}
            </div>
            <div class="cat-tags">
              <span class="badge badge-lvl"
                >Rs. {{ order.grandTotal | number: '1.0-2' }}</span
              >
            </div>
          </div>
          <div class="cat-actions">
            <button class="btn-edit" [routerLink]="['/admin/orders', order.id]">
              View
            </button>
          </div>
        </div>

        <div class="empty-state-row" *ngIf="orders.length === 0">
          <p>No orders found.</p>
        </div>

        <div class="pagination-controls" *ngIf="totalPages > 1">
          <ion-button
            size="small"
            fill="outline"
            [disabled]="page === 1"
            (click)="goToPage(page - 1)"
            >Previous</ion-button
          >
          <span
            >Page {{ page }} of {{ totalPages }} (Total: {{ totalItems }})</span
          >
          <ion-button
            size="small"
            fill="outline"
            [disabled]="page === totalPages"
            (click)="goToPage(page + 1)"
            >Next</ion-button
          >
        </div>
      </div>
    </ion-content>
  `,
  styles: [
    `
    
      .page-shell {
        margin: 0 auto;
        padding: 20px 16px 32px;
        display: flex;
        flex-direction: column;
        gap: 14px;
        .top-bar {
          .page-heading {
            font-size: 20px;
            font-weight: 700;
            color: #2c1a22;
            margin: 0;
            margin-bottom: 6px;
          }
        }
        .theme-search {
          --background: #ffffff;
          --border-radius: 12px;
          --box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
          padding: 0;

          ion-select {
            &::part(wrapper) {
              justify-content: flex-end;
            }
          }
        }

        .modal-grid-2 {
          grid-template-columns: 2fr 1fr;
        }
        .section-label {
          font-size: 12px;
          font-weight: 700;
          color: #0ea87d;
          letter-spacing: 0.7px;
          text-transform: uppercase;
          margin-block: 0px;
          padding-left: 6px;
          display: block;
        }
        .cat-card {
          gap: 14px;
          background: var(--color-white-near-white);
          border-radius: var(--app-border-radius-large, 18px);
          padding: 0.8rem 1.25rem;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
          border: 1px solid var(--color-soft-blue-gray);
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: box-shadow 0.2s;
          .cat-body {
            flex: 1;
            min-width: 0;
            .cat-name {
              font-size: 15px;
              font-weight: 700;
              color: #2c1a22;
              margin-bottom: 2px;
              display: flex;
              gap: 15px;
              align-items: center;
              .badge {
                line-height: 0;
              }
            }
            .cat-slug {
              font-size: 12px;
              color: #a0758c;
              font-family: monospace;
              margin-bottom: 6px;
            }
            .cat-tags {
              display: flex;
              align-items: center;
              gap: 6px;
              flex-wrap: wrap;
            }
          }
          .cat-actions {
            button {
              /* moved shared button styling to src/global.scss */
            }

          }
        }
      }
      // Fallback Container rows
      .empty-state-row {
        padding: 40px;
        text-align: center;
        color: #6b7280;
        font-size: 14px;
      }
      :host ::ng-deep {
        .cat-name {
          ion-badge {
            font-size: 10px !important;
          }
        }
      }
    `,
  ],
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
    this.adminService
      .getOrders({
        search: this.search,
        status: this.statusFilter,
        page: this.page,
        limit: this.limit,
      })
      .subscribe((res) => {
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
