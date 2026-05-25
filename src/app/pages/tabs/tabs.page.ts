import { Component } from '@angular/core';
import { IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular/standalone';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs],
  template: `
      <ion-router-outlet></ion-router-outlet>
    <ion-tabs>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="home" href="/home">
          <ion-icon name="home-outline"></ion-icon>
          <ion-label>Home</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="categories" href="/categories">
          <ion-icon name="grid-outline"></ion-icon>
          <ion-label>Categories</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="cart" href="/cart">
          <ion-icon name="bag-handle-outline"></ion-icon>
          <ion-label>Cart</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="orders" href="/orders">
          <ion-icon name="receipt-outline"></ion-icon>
          <ion-label>Orders</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="profile" href="/profile">
          <ion-icon name="person-outline"></ion-icon>
          <ion-label>Profile</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
  styles: [`
    @media (min-width: 992px) {
      ion-tab-bar {
        display: none;
      }
    }
  `],
})
export class TabsPage {}
