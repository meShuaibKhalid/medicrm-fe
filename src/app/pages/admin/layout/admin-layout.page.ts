import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent, IonHeader, IonItem, IonList, IonMenu, IonMenuButton, IonRouterOutlet, IonSplitPane, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, IonContent, IonHeader, IonItem, IonList, IonMenu, IonMenuButton, IonRouterOutlet, IonSplitPane, IonTitle, IonToolbar],
  template: `
    <ion-split-pane contentId="admin-content">
      <ion-menu contentId="admin-content">
        <ion-header><ion-toolbar color="primary"><ion-title>Admin</ion-title></ion-toolbar></ion-header>
        <ion-content>
          <ion-list>
            <ion-item routerLink="/admin/dashboard">Dashboard</ion-item>
            <ion-item routerLink="/admin/products">Products</ion-item>
            <ion-item routerLink="/admin/categories">Categories</ion-item>
            <ion-item routerLink="/admin/orders">Orders</ion-item>
            <ion-item routerLink="/admin/users">Users</ion-item>
          </ion-list>
        </ion-content>
      </ion-menu>

      <div class="ion-page" id="admin-content">
        <ion-header class="ion-no-border">
          <ion-toolbar>
            <ion-menu-button slot="start"></ion-menu-button>
            <ion-title>Admin Panel</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-router-outlet></ion-router-outlet>
      </div>
    </ion-split-pane>
  `,
})
export class AdminLayoutPage {}
