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

    .page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      background: var(--color-ice-blue);
      font-family: 'Poppins', sans-serif;
    }

    .card {
      background: var(--color-white-near-white);
      border-radius: var(--app-border-radius-large, 18px);
      padding: 2.5rem 2rem 2rem;
      width: 100%;
      max-width: 400px;
      box-shadow: 0 8px 40px rgba(12,20,39,0.06), 0 1px 4px rgba(0,0,0,0.04);
      display: flex;
      flex-direction: column;
      align-items: center;
      border: 1px solid var(--color-soft-blue-gray);
    }

    .logo-wrap {
      width: 68px;
      height: 68px;
      border-radius: 50%;
      background: var(--color-pale-mint);
      border: 2.5px solid var(--ion-color-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.2rem;
    }

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

    .form-stack {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .field {
      width: 100%;
      border: 1.5px solid var(--color-soft-blue-gray);
      border-radius: var(--app-border-radius, 12px);
      padding: 0.8rem 1rem;
      font-size: 14px;
      color: var(--color-navy-black);
      background: var(--color-white-near-white);
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .field::placeholder { color: var(--color-blue-gray); }
    .field:focus {
      border-color: var(--ion-color-primary);
      box-shadow: 0 0 0 3px rgba(14,168,125,0.10);
      background: var(--color-white-near-white);
    }

    .btn-send {
      width: 100%;
      padding: 0.9rem;
      background: var(--ion-color-primary);
      color: #fff;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.08em;
      border: none;
      border-radius: var(--app-border-radius, 12px);
      cursor: pointer;
      text-transform: uppercase;
      margin-top: 0.4rem;
      transition: background 0.18s;
    }

    .divider {
      width: 100%;
      height: 1px;
      background: var(--color-soft-blue-gray);
      margin: 1rem 0 0.6rem;
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
      <div class="page">
        <div class="card">
          <div class="logo-wrap">
            <ion-img  src="../assets/logo.png" alt="Logo" ></ion-img>
          </div>

          <h1>Welcome Back</h1>
          <p class="subtitle">Login to your account</p>

          <div class="form-stack">
            <input class="field" type="text" placeholder="Email or phone" [(ngModel)]="identifier" />
            <input class="field" type="password" placeholder="Password" [(ngModel)]="password" />

            <button class="btn-send" (click)="login()">Sign In</button>
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
