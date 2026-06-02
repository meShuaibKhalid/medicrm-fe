import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IonButton, IonContent, IonHeader, IonImg, IonInput, IonItem, IonLabel, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, IonButton, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonTitle, IonToolbar,IonImg],
  styles: [`
    :host { --ion-background-color: var(--color-ice-blue); }

    h1 {
      font-size: 26px;
      font-weight: 700;
      color: var(--color-navy-black);
      margin: 0 0 0.35rem;
    }

    .subtitle {
      font-size: 14px;
      color: var(--color-slate-gray);
      margin-bottom: 1.75rem;
    }

    .footer-link {
      font-size: 13px;
      color: var(--color-slate-gray);
      text-align: center;
    }

    .footer-link a {
      color: var(--ion-color-primary);
      font-weight: 500;
      text-decoration: none;
    }
  `],
  template: `
    <ion-content>
      <div class="auth-page">
        <div class="auth-card">
          <div class="auth-logo-wrap">
            <ion-img  src="../assets/logo.png" alt="Logo" ></ion-img>
          </div>

          <h1>Welcome Back</h1>
          <p class="subtitle">Login to your account</p>

          <div class="form-stack">
            <input class="auth-field" type="text" placeholder="Email or phone" [(ngModel)]="identifier" />
            <input class="auth-field" type="password" placeholder="Password" [(ngModel)]="password" />

            <button class="auth-btn" (click)="login()">Sign In</button>
          </div>

          <div class="divider"></div>
          <p class="footer-link">Don't have an account? <a routerLink="/register">Create one</a></p>
        </div>
      </div>
    </ion-content>
  `,
})
export class LoginPage {
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  identifier = '';
  password = '';

  login(): void {
    this.authService.login(this.identifier, this.password).subscribe({
      next: () => {
        const pending = this.cartService.consumePendingItem();
        if (pending) {
          this.cartService.addItem(pending.product, pending.quantity);
          this.router.navigateByUrl(pending.returnUrl || '/cart');
          return;
        }
        const redirectTo = this.route.snapshot.queryParamMap.get('redirectTo') ?? '/home';
        this.router.navigateByUrl(redirectTo);
      },
      error: (err) => {
        alert(err.error?.message || 'Login failed. Please check your credentials.');
      }
    });
  }
}
