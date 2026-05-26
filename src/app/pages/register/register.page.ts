import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  IonButton, IonContent, IonCheckbox, IonLabel
} from '@ionic/angular/standalone';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, IonButton, IonContent, IonCheckbox, IonLabel],
  styles: [`
    :host { --ion-background-color: var(--color-ice-blue); }

    .page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
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

    .btn-send:hover { background: var(--color-fresh-green); }

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
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path d="M18 30C18 30 5 22.5 5 13.5C5 9.36 8.36 6 12.5 6C14.96 6 17.16 7.18 18 9C18.84 7.18 21.04 6 23.5 6C27.64 6 31 9.36 31 13.5C31 22.5 18 30 18 30Z" fill="#d45a85"/>
              <path d="M18 27C18 27 8 20.5 8 13.5C8 10.5 10.5 8 13.5 8C15.5 8 17.2 9 18 10.5C18.8 9 20.5 8 22.5 8C25.5 8 28 10.5 28 13.5C28 20.5 18 27 18 27Z" fill="#f99cb9"/>
              <path d="M18 23C18 23 11 18.5 11 14.5C11 12.6 12.6 11 14.5 11C15.8 11 16.9 11.7 17.5 12.7L18 13.5L18.5 12.7C19.1 11.7 20.2 11 21.5 11C23.4 11 25 12.6 25 14.5C25 18.5 18 23 18 23Z" fill="#fff0f5"/>
            </svg>
          </div>

          <h1>Hey There!</h1>
          <p class="subtitle">Login below to explore more</p>

          <div class="form-stack">
            <input class="field" type="text"     placeholder="Your name*"            [(ngModel)]="name"     />
            <input class="field" type="tel"      placeholder="Enter a phone number*" [(ngModel)]="phone"    />
            <input class="field" type="email"    placeholder="Email Address"         [(ngModel)]="email"    />
            <input class="field" type="password" placeholder="Password*"             [(ngModel)]="password" />
            <input class="field" type="password" placeholder="Confirm Password*"     [(ngModel)]="confirmPassword" />

            <div class="checkbox-row">
              <ion-checkbox></ion-checkbox>
              <span class="checkbox-label">I agree to receive emails and notification updates.</span>
            </div>

            <button class="btn-send" (click)="register()">Sign Up</button>
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