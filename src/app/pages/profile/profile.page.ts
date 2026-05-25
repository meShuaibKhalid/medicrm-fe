import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, AsyncPipe, IonIcon, IonButton, IonContent, IonHeader, IonItem, IonLabel, IonList, IonTitle, IonToolbar],
  styles: [`
    :host { --ion-background-color: #faf5f7; }

    .header-title {
      font-family: 'DM Sans', sans-serif;
      font-weight: 700;
      color: #2a1a22;
    }

    .profile-container {
      padding: 1.5rem 1rem;
      font-family: 'DM Sans', sans-serif;
      max-width: 600px;
      margin: 0 auto;
    }

    .user-card {
      background: linear-gradient(135deg, #d45a85 0%, #b33f6c 100%);
      border-radius: 20px;
      padding: 2rem 1.5rem;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      box-shadow: 0 10px 30px rgba(212, 90, 133, 0.3);
      margin-bottom: 2rem;
    }

    .avatar {
      width: 70px;
      height: 70px;
      background: #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      font-weight: 700;
      color: #d45a85;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .user-info h2 {
      margin: 0 0 0.25rem 0;
      font-size: 22px;
      font-weight: 700;
    }

    .user-info p {
      margin: 0;
      font-size: 14px;
      opacity: 0.9;
      line-height: 1.4;
    }

    .menu-card {
      background: #fff;
      border-radius: 20px;
      padding: 0.5rem;
      box-shadow: 0 4px 16px rgba(0,0,0,0.04);
      margin-bottom: 1.5rem;
    }

    ion-item {
      --padding-start: 1rem;
      --inner-padding-end: 1rem;
      --background: transparent;
      font-weight: 500;
      color: #2a1a22;
      border-radius: 12px;
      margin: 0.2rem 0;
    }

    ion-item::part(native):hover {
      background: #fdfafb;
    }

    ion-icon {
      color: #d45a85;
      margin-right: 12px;
      font-size: 20px;
    }

    .logout-btn {
      width: 100%;
      padding: 1rem;
      background: #fff;
      color: #d45a85;
      font-size: 15px;
      font-weight: 700;
      border: 2px solid #f0e0e8;
      border-radius: 16px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .logout-btn:hover {
      background: #fff0f5;
      border-color: #f9c2d4;
    }
  `],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title class="header-title">My Profile</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="profile-container" *ngIf="authService.currentUser$ | async as user">
        
        <div class="user-card">
          <div class="avatar">{{ user.name.charAt(0).toUpperCase() }}</div>
          <div class="user-info">
            <h2>{{ user.name }}</h2>
            <p>{{ user.email }}</p>
            <p>{{ user.phone }}</p>
          </div>
        </div>

        <div class="menu-card">
          <ion-list lines="none">
            <ion-item button detail="true" (click)="router.navigateByUrl('/orders')">
              <ion-icon name="receipt-outline"></ion-icon>
              <ion-label>My Orders</ion-label>
            </ion-item>
            <ion-item button detail="true" (click)="router.navigateByUrl('/addresses')">
              <ion-icon name="location-outline"></ion-icon>
              <ion-label>Saved Addresses</ion-label>
            </ion-item>
          </ion-list>
        </div>

        <button class="logout-btn" (click)="logout()">Sign Out</button>

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
