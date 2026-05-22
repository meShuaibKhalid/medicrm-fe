import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IonButton, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, IonButton, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonTitle, IonToolbar],
  template: `
    <ion-header class="ion-no-border"><ion-toolbar><ion-title>Login</ion-title></ion-toolbar></ion-header>
    <ion-content>
      <div class="page-shell form-stack">
        <ion-item class="soft-card"><ion-label position="stacked">Email or phone</ion-label><ion-input [(ngModel)]="identifier"></ion-input></ion-item>
        <ion-item class="soft-card"><ion-label position="stacked">Password</ion-label><ion-input [(ngModel)]="password" type="password"></ion-input></ion-item>
        <ion-button expand="block" shape="round" (click)="login()">Login</ion-button>
        <ion-button fill="clear" routerLink="/register">Create an account</ion-button>
      </div>
    </ion-content>
  `,
})
export class LoginPage {
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  identifier = 'ayesha@example.com';
  password = 'password';

  login(): void {
    this.authService.login(this.identifier, this.password).subscribe(() => {
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
