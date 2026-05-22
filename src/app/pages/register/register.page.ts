import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IonButton, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, IonButton, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonTitle, IonToolbar],
  template: `
    <ion-header class="ion-no-border"><ion-toolbar><ion-title>Register</ion-title></ion-toolbar></ion-header>
    <ion-content>
      <div class="page-shell form-stack">
        <ion-item class="soft-card"><ion-label position="stacked">Name</ion-label><ion-input [(ngModel)]="name"></ion-input></ion-item>
        <ion-item class="soft-card"><ion-label position="stacked">Phone</ion-label><ion-input [(ngModel)]="phone"></ion-input></ion-item>
        <ion-item class="soft-card"><ion-label position="stacked">Email</ion-label><ion-input [(ngModel)]="email"></ion-input></ion-item>
        <ion-item class="soft-card"><ion-label position="stacked">Password</ion-label><ion-input [(ngModel)]="password" type="password"></ion-input></ion-item>
        <ion-button expand="block" shape="round" (click)="register()">Register</ion-button>
        <ion-button fill="clear" routerLink="/login">Already have an account?</ion-button>
      </div>
    </ion-content>
  `,
})
export class RegisterPage {
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  name = '';
  phone = '';
  email = '';
  password = '';

  register(): void {
    this.authService.register({ name: this.name, phone: this.phone, email: this.email, password: this.password }).subscribe(() => {
      const pending = this.cartService.consumePendingItem();
      if (pending) {
        this.cartService.addItem(pending.product, pending.quantity);
        this.router.navigateByUrl(pending.returnUrl || '/cart');
        return;
      }
      const redirectTo = this.route.snapshot.queryParamMap.get('redirectTo') ?? '/home';
      this.router.navigateByUrl(redirectTo);
    });
  }
}
