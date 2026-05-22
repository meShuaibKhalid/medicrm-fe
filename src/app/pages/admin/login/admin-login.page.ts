import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule, IonButton, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonTitle, IonToolbar],
  template: `
    <ion-header class="ion-no-border"><ion-toolbar><ion-title>Admin Login</ion-title></ion-toolbar></ion-header>
    <ion-content>
      <div class="page-shell form-stack">
        <ion-item class="soft-card"><ion-label position="stacked">Email</ion-label><ion-input [(ngModel)]="email"></ion-input></ion-item>
        <ion-item class="soft-card"><ion-label position="stacked">Password</ion-label><ion-input [(ngModel)]="password" type="password"></ion-input></ion-item>
        <ion-button expand="block" shape="round" (click)="login()">Login</ion-button>
      </div>
    </ion-content>
  `,
})
export class AdminLoginPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  email = 'admin@dvagoclone.local';
  password = 'password';

  login(): void {
    this.authService.login(this.email, this.password, true).subscribe(() => this.router.navigateByUrl('/admin/dashboard'));
  }
}
