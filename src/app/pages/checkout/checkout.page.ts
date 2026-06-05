import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  logoWhatsapp,
  informationCircleOutline,
} from 'ionicons/icons';
addIcons({
  logoWhatsapp,
  informationCircleOutline,
});
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonRadio,
  IonRadioGroup,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  IonIcon,
} from '@ionic/angular/standalone';
import { AddressService } from '../../core/services/address.service';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { Address } from '../../shared/models/app.models';

@Component({
  selector: 'app-app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonButton,
    IonCard,
    IonCardContent,
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonRadio,
    IonRadioGroup,
    IonSelect,
    IonSelectOption,
    IonTitle,
    IonToolbar,
    IonIcon,
  ],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title class="header-title">Checkout</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="page-shell">
        <ion-card class="soft-card" *ngIf="currentUser">
          <ion-card-content>
            <h3>Contact Details (from Profile)</h3>
            <ion-item>
              <ion-label position="stacked">Name</ion-label>
              <ion-input [(ngModel)]="name"></ion-input>
            </ion-item>
            <ion-item>
              <ion-label position="stacked">Email</ion-label>
              <ion-input [(ngModel)]="email"></ion-input>
            </ion-item>
            <ion-item>
              <ion-label position="stacked">Phone</ion-label>
              <ion-input [(ngModel)]="phone"></ion-input>
            </ion-item>
          </ion-card-content>
        </ion-card>

        <ion-card class="soft-card" *ngIf="addresses.length > 0">
          <ion-card-content>
            <div class="section-title">
              <h3>Select Delivery Address</h3>
              <ion-button fill="clear" size="small" routerLink="/addresses"
                >Manage</ion-button
              >
            </div>
            <ion-item>
              <ion-label>Address Option</ion-label>
              <ion-select
                [ngModel]="selectedAddressId"
                (ngModelChange)="onAddressSelect($event)"
                interface="popover"
              >
                <ion-select-option
                  *ngFor="let addr of addresses"
                  [value]="addr.id"
                >
                  {{ addr.fullName }} · {{ addr.addressLine }}, {{ addr.city }}
                </ion-select-option>
              </ion-select>
            </ion-item>
            <div
              *ngIf="selectedAddress"
              style="margin-top: 12px; color: #5c4b53; font-size: 0.95rem;"
            >
              <p>
                <strong>Recipient:</strong> {{ selectedAddress.fullName }} ·
                {{ selectedAddress.phone }}
              </p>
              <p>
                {{ selectedAddress.addressLine }}, {{ selectedAddress.area }},
                {{ selectedAddress.city }}
              </p>
              <p *ngIf="selectedAddress.nearestLandmark">
                Landmark: {{ selectedAddress.nearestLandmark }}
              </p>
            </div>
          </ion-card-content>
        </ion-card>

        <ion-card class="soft-card" *ngIf="addresses.length === 0">
          <ion-card-content style="text-align: center; padding: 20px;">
            <h3>No addresses added</h3>
            <p style="color: #68818d; margin-bottom: 12px;">
              You need to add a shipping address before completing order.
            </p>
            <ion-button size="small" fill="solid" routerLink="/addresses"
              >Add Address</ion-button
            >
          </ion-card-content>
        </ion-card>

        <ion-card class="soft-card">
          <ion-card-content>
            <h3>Order summary</h3>
            <div class="line">
              <span>Subtotal</span
              ><strong>Rs. {{ cart.subtotal | number: '1.0-2' }}</strong>
            </div>
            <div class="line">
              <span>Discount</span
              ><strong>- Rs. {{ cart.discountTotal | number: '1.0-2' }}</strong>
            </div>
            <div class="line">
              <span>Delivery fee</span
              ><strong>Rs. {{ cart.deliveryFee | number: '1.0-2' }}</strong>
            </div>
            <div class="line grand">
              <span>Grand total</span
              ><strong>Rs. {{ cart.grandTotal | number: '1.0-2' }}</strong>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- <ion-list class="soft-card">
          <ion-item>
            <ion-label>Payment method</ion-label>
          </ion-item>
          <ion-radio-group value="cod">
            <ion-item>
              <ion-radio slot="start" value="cod"></ion-radio>
              <ion-label>Cash on Delivery</ion-label>
            </ion-item>
          </ion-radio-group>
        </ion-list> -->

        <ion-list class="soft-card payment-card">
          <ion-item lines="full" class="section-head">
            <ion-label class="section-label">Payment method</ion-label>
          </ion-item>

          <!-- Cash on Delivery -->
          <ion-item
            lines="full"
            class="method-row"
            button
            (click)="selectMethod('cod')"
          >
            <div
              class="method-radio"
              slot="start"
              [class.checked]="selectedMethod === 'cod'"
            >
              <div
                class="radio-dot"
                [class.visible]="selectedMethod === 'cod'"
              ></div>
            </div>
            <ion-label>
              <h3 class="method-name">Cash on Delivery</h3>
              <p class="method-desc">Pay when your order arrives</p>
            </ion-label>
          </ion-item>

          <!-- Online Transfer -->
          <ion-item
            lines="none"
            class="method-row"
            button
            (click)="selectMethod('transfer')"
          >
            <div
              class="method-radio"
              slot="start"
              [class.checked]="selectedMethod === 'transfer'"
            >
              <div
                class="radio-dot"
                [class.visible]="selectedMethod === 'transfer'"
              ></div>
            </div>
            <ion-label>
              <h3 class="method-name">Online Transfer</h3>
              <p class="method-desc">JazzCash, Easypaisa or Bank</p>
            </ion-label>
            <ion-icon
              name="chevron-forward-outline"
              slot="end"
              [style.transform]="
                transferPanelOpen ? 'rotate(90deg)' : 'rotate(0)'
              "
              style="transition: transform 0.2s; color: #10B981;"
            >
            </ion-icon>
          </ion-item>

          <!-- Gateway panel -->
          <div class="gateway-panel" [class.open]="transferPanelOpen">
            <div class="gateway-inner">
              <!-- JazzCash -->
              <div
                class="gw-row"
                [class.selected]="selectedGateway === 'jazzcash'"
                (click)="selectGateway('jazzcash')"
              >
                <div class="gw-info">
                  <div class="gw-name">JazzCash</div>
                  <div class="gw-num">0306-0162084</div>
                </div>
                <button
                  class="copy-btn"
                  [class.copied]="copiedStates['btn1']"
                  (click)="
                    $event.stopPropagation();
                    copyToClipboard('03060162084', 'btn1')
                  "
                >
                  {{ copiedStates['btn1'] ? '✓ Copied' : 'Copy' }}
                </button>
                <div
                  class="gw-check"
                  [class.visible]="selectedGateway === 'jazzcash'"
                >
                  ✓
                </div>
              </div>

              <!-- Easypaisa -->
              <div
                class="gw-row"
                [class.selected]="selectedGateway === 'easypaisa'"
                (click)="selectGateway('easypaisa')"
              >
                <div class="gw-info">
                  <div class="gw-name">Easypaisa</div>
                  <div class="gw-num">0306-0162084</div>
                </div>
                <button
                  class="copy-btn"
                  [class.copied]="copiedStates['btn2']"
                  (click)="
                    $event.stopPropagation();
                    copyToClipboard('03060162084', 'btn2')
                  "
                >
                  {{ copiedStates['btn2'] ? '✓ Copied' : 'Copy' }}
                </button>
                <div
                  class="gw-check"
                  [class.visible]="selectedGateway === 'easypaisa'"
                >
                  ✓
                </div>
              </div>

              <!-- Bank Transfer -->
              <div
                class="gw-row"
                [class.selected]="selectedGateway === 'bank'"
                (click)="selectGateway('bank')"
              >
                <div class="gw-info">
                  <div class="gw-name">Bank Transfer</div>
                  <div class="gw-num">Via IBAN</div>
                </div>
                <div
                  class="gw-check"
                  [class.visible]="selectedGateway === 'bank'"
                >
                  ✓
                </div>
              </div>

              <!-- IBAN block -->
              <div class="iban-block" *ngIf="selectedGateway === 'bank'">
                <div class="iban-label">Bank details</div>
                <div class="iban-row">
                  <div>
                    <div class="iban-num">PK36 SCBL 0000 0011 2345 6702</div>
                    <div class="iban-bank">
                      Standard Chartered · Pharma Store PK
                    </div>
                  </div>
                  <button
                    class="copy-btn"
                    [class.copied]="copiedStates['btn3']"
                    (click)="
                      $event.stopPropagation();
                      copyToClipboard('PK36SCBL0000001123456702', 'btn3')
                    "
                  >
                    {{ copiedStates['btn3'] ? '✓ Copied' : 'Copy' }}
                  </button>
                </div>
              </div>
              <!-- Add this right after the iban-block div, still inside gateway-inner -->
              <div class="payment-note">
                <ion-icon
                  name="information-circle-outline"
                  class="note-icon"
                ></ion-icon>
                <div class="note-text">
                  <p class="note-title">How to complete your payment</p>
                  <p class="note-desc">
                    <span>
                      After transferring the amount, send a screenshot of your
                      payment to our WhatsApp:
                    </span>
                    <a class="note-link" target="_blank" href="https://wa.me/923060162084">
                      <ion-icon name="logo-whatsapp"></ion-icon>
                      0306-0162084
                    </a>
                  </p>
                  <p class="note-desc">
                    Your order will be confirmed once payment is verified.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ion-list>

        <ion-button
          expand="block"
          shape="round"
          [disabled]="!selectedAddress || !cart.items.length || placingOrder"
          (click)="placeOrder()"
        >
          <span *ngIf="!placingOrder">Place Order</span>
          <span *ngIf="placingOrder">Placing...</span>
        </ion-button>
      </div>
    </ion-content>
  `,
  styles: [
    `
      .page-shell {
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        max-width: 800px;
        margin: 0 auto;
        font-family: 'Poppins', sans-serif;
      }

      .header-title {
        font-family: 'Poppins', sans-serif;
        font-weight: 600;
        color: var(--color-navy-black);
        padding: 0 1rem;
        max-width: 800px;
        margin: 0 auto;
        font-size: 1.2rem;
      }
      .line {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
      }
      .grand {
        padding-top: 8px;
        border-top: 1px solid #dce7e5;
      }
      .payment-card {
        border-radius: 18px;
        overflow: hidden;
        box-shadow: 0 2px 16px rgba(16, 185, 129, 0.08);
        padding: 0;
      }

      .section-head .section-label {
        font-size: 14px;
        font-weight: 700;
        color: #10b981;
        letter-spacing: 0.7px;
        text-transform: uppercase;
      }
      .payment-note {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        background: #f0fdf8;
        border: 1.5px solid #d1fae5;
        border-radius: 14px;
        padding: 12px 14px;
        margin-top: 2px;

        .note-icon {
          color: #10b981;
          font-size: 20px;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .note-text {
          display: flex;
          flex-direction: column;
          gap: 4px;
          width: 100%;
        }

        .note-title {
          font-size: 13px;
          font-weight: 700;
          color: #0d1b2a;
          margin: 0;
        }

        .note-desc {
          font-size: 12px;
          color: #64748b;
          line-height: 1.5;
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .note-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: #10b981;
          font-weight: 700;
          text-decoration: none;
          margin-left: 4px;

          ion-icon {
            font-size: 14px;
          }
        }
      }
      .method-row {
        --background: #fff;
        --border-color: #f0f9f5;
        .method-radio {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid #d1d5db;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: border-color 0.15s;
          margin-right: 10px;
          &.checked {
            border-color: #10b981;
          }
          .radio-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #10b981;
            opacity: 0;
            transition: opacity 0.15s;
            &.visible {
              opacity: 1;
            }
          }
        }
        .method-name {
          font-size: 14px;
          font-weight: 600;
          color: #0d1b2a;
        }
        .method-desc {
          font-size: 12px;
          color: #64748b;
        }
      }

      .gateway-panel {
        max-height: 0;
        overflow: hidden;
        opacity: 0;
        transition:
          max-height 0.35s ease,
          opacity 0.25s ease;
        background: #f9fffe;
        border-top: 1px solid #f0f9f5;
        &.open {
          max-height: 500px;
          opacity: 1;
        }
      }

      .gateway-inner {
        padding: 14px 16px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .gw-row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 14px;
        background: #fff;
        border-radius: 14px;
        border: 1.5px solid #e2f5ee;
        cursor: pointer;
        transition: border-color 0.15s;
        &:hover {
          border-color: #10b981;
        }
        &.selected {
          border-color: #10b981;
          background: #f0fdf8;
        }
        .gw-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          &.jazzcash {
            background: #e8f5e9;
          }
          &.easypaisa {
            background: #e3f2fd;
          }
          &.bank {
            background: #fff3e0;
          }
        }
        .gw-info {
          flex: 1;
        }
        .gw-name {
          font-size: 14px;
          font-weight: 600;
          color: #0d1b2a;
        }
        .gw-num {
          font-size: 12px;
          color: #10b981;
          font-family: monospace;
          font-weight: 600;
        }
        .gw-check {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #10b981;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 12px;
          opacity: 0;
          transition: opacity 0.15s;
          &.visible {
            opacity: 1;
          }
        }
      }

      .copy-btn {
        background: #f0f9f5;
        border: none;
        border-radius: 8px;
        padding: 4px 10px;
        font-size: 11px;
        font-weight: 700;
        color: #10b981;
        cursor: pointer;
      }

      .iban-block {
        background: #fff;
        border-radius: 14px;
        border: 1.5px solid #e2f5ee;
        padding: 12px 14px;
        .iban-label {
          font-size: 11px;
          font-weight: 700;
          color: #10b981;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }
        .iban-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .iban-num {
          font-size: 13px;
          font-family: monospace;
          font-weight: 600;
          color: #0d1b2a;
        }
        .iban-bank {
          font-size: 11px;
          color: #64748b;
          margin-top: 2px;
        }
      }
    `,
  ],
})
export class CheckoutPage {
  readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly addressService = inject(AddressService);
  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);
  selectedMethod: 'cod' | 'transfer' = 'cod';
  selectedGateway: 'jazzcash' | 'easypaisa' | 'bank' | null = null;
  transferPanelOpen = false;

  selectMethod(method: 'cod' | 'transfer') {
    this.selectedMethod = method;
    this.transferPanelOpen = method === 'transfer';
    if (method === 'cod') {
      this.selectedGateway = null;
    }
  }

  copiedStates: { [key: string]: boolean } = {};
  selectGateway(gw: 'jazzcash' | 'easypaisa' | 'bank') {
    this.selectedGateway = gw;
  }

  copyToClipboard(value: string, id: string): void {
    navigator.clipboard.writeText(value).then(() => {
      this.copiedStates[id] = true;
      setTimeout(() => (this.copiedStates[id] = false), 2000);
    });
  }
  currentUser: any = null;
  addresses: Address[] = [];
  selectedAddressId = '';
  name = '';
  email = '';
  phone = '';

  constructor() {
    const token = localStorage.getItem('token');
    if (!token && !this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], {
        queryParams: { redirectTo: '/checkout' },
      });
      return;
    }
    if (!this.cart.items.length) {
      this.router.navigateByUrl('/cart');
      return;
    }

    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.currentUser = user;
        this.name = user.name || '';
        this.email = user.email || '';
        this.phone = user.phone || '';
      }
    });

    this.addressService.getAddresses().subscribe((addrs) => {
      this.addresses = addrs;
      const def = addrs.find((a) => a.isDefault) || addrs[0];
      if (def) {
        this.selectedAddressId = def.id;
      }
    });
  }

  get selectedAddress(): Address | undefined {
    return this.addresses.find((a) => a.id === this.selectedAddressId);
  }

  onAddressSelect(id: string): void {
    this.selectedAddressId = id;
    this.addressService.setDefaultAddress(id).subscribe();
  }

  get cart() {
    return this.cartService.getCurrentCart();
  }

  placingOrder = false;

  placeOrder(): void {
    const cart = this.cartService.getCurrentCart();
    const addressId = this.selectedAddressId;
    if (!cart.items.length || !addressId) {
      return;
    }

    this.placingOrder = true;
    this.orderService.createOrder({ addressId }).subscribe({
      next: () => {
        this.placingOrder = false;
        this.cartService.clearCart(); // Clear local state, backend clears it too
        this.router.navigateByUrl('/order-success');
      },
      error: (err) => {
        this.placingOrder = false;
        alert(err.error?.message || 'Failed to place order. Please try again.');
      },
    });
  }
}
