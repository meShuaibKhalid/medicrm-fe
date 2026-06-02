import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonHeader, IonItem, IonList, IonMenu, IonMenuButton, IonRouterOutlet, IonSplitPane, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { AuthService } from '../../../core/services/auth.service';

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
            <ion-item routerLink="/home">
              Switch to User View
            </ion-item>
            <ion-item (click)="logout()" style="--color: #eb445a; font-weight: 600; cursor: pointer;">
              Logout
            </ion-item>
          </ion-list>
        </ion-content>
      </ion-menu>

      <div class="ion-page" id="admin-content">
        <!-- <ion-header class="ion-no-border">
          <ion-toolbar>
            <ion-menu-button slot="start"></ion-menu-button>
            <ion-title>Admin Panel</ion-title>
          </ion-toolbar>
        </ion-header> -->
        <ion-content>

          <ion-router-outlet></ion-router-outlet>
        </ion-content>
      </div>
    </ion-split-pane>
  `,
})
export class AdminLayoutPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/home');
  }
}

