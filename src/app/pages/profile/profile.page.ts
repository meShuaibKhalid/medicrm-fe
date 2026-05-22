import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonHeader, IonItem, IonLabel, IonList, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, AsyncPipe, IonButton, IonContent, IonHeader, IonItem, IonLabel, IonList, IonTitle, IonToolbar],
  template: `
    <ion-header class="ion-no-border"><ion-toolbar><ion-title>Profile</ion-title></ion-toolbar></ion-header>
    <ion-content>
      <div class="page-shell" *ngIf="authService.currentUser$ | async as user">
        <ion-list class="soft-card">
          <ion-item lines="full"><ion-label><h2>{{ user.name }}</h2><p>{{ user.phone }}</p><p>{{ user.email }}</p></ion-label></ion-item>
          <ion-item button (click)="router.navigateByUrl('/orders')"><ion-label>My Orders</ion-label></ion-item>
          <ion-item button (click)="router.navigateByUrl('/addresses')"><ion-label>My Addresses</ion-label></ion-item>
        </ion-list>
        <ion-button expand="block" color="medium" fill="outline" (click)="logout()">Logout</ion-button>
      </div>
    </ion-content>
  `,
})
export class ProfilePage {
  readonly authService = inject(AuthService);
  readonly router = inject(Router);

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
