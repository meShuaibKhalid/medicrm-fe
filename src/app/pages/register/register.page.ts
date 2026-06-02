import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  IonButton, IonContent, IonCheckbox, IonLabel,
  IonImg
} from '@ionic/angular/standalone';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, IonButton, IonContent, IonCheckbox, IonLabel,IonImg],
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

    .checkbox-row {
      display: flex;
      align-items: flex-start;
      gap: 10px;
    }

    .checkbox-label {
      font-size: 13px;
      color: var(--color-slate-gray);
      line-height: 1.5;
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
              <ion-img  src="../assets/logo.png" alt="Logo"></ion-img>
          </div>

          <h1>Hey There!</h1>
          <p class="subtitle">Login below to explore more</p>

          <div class="form-stack">
            <input class="auth-field" type="text"     placeholder="Your name*"            [(ngModel)]="name"     />
            <input class="auth-field" type="tel"      placeholder="Enter a phone number*" [(ngModel)]="phone"    />
            <input class="auth-field" type="email"    placeholder="Email Address"         [(ngModel)]="email"    />
            <input class="auth-field" type="password" placeholder="Password*"             [(ngModel)]="password" />
            <input class="auth-field" type="password" placeholder="Confirm Password*"     [(ngModel)]="confirmPassword" />

            <button class="auth-btn" (click)="register()">Sign Up</button>
          </div>

          <div class="divider"></div>
          <p class="footer-link">Already have an account? <a routerLink="/login">Sign in</a></p>
        </div>
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
  confirmPassword = '';

  register(): void {
    if (!this.name || !this.phone || !this.email || !this.password) {
      alert('Please fill all required fields');
      return;
    }
    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    this.authService.register({ name: this.name, phone: this.phone, email: this.email, password: this.password }).subscribe({
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
        alert(err.error?.message || 'Registration failed. Please check your inputs.');
      }
    });
  }
}
