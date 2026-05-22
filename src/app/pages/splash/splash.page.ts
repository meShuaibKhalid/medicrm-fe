import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';

@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [RouterLink, IonButton, IonContent, IonIcon, IonSpinner],
  template: `
    <ion-content [fullscreen]="true">
      <div class="splash">
        <div class="logo"><ion-icon name="medkit-outline"></ion-icon></div>
        <h1>PharmaGo</h1>
        <p>Your trusted online pharmacy</p>
        <ion-spinner name="crescent" color="primary"></ion-spinner>
        <ion-button routerLink="/home" shape="round">Continue</ion-button>
      </div>
    </ion-content>
  `,
  styles: [`
    .splash {
      min-height: 100%;
      display:flex;
      flex-direction:column;
      align-items:center;
      justify-content:center;
      gap:14px;
      padding:24px;
      background: radial-gradient(circle at top, #dff6ee, #f4f8f7 60%);
      text-align:center;
    }
    .logo {
      width: 84px;
      height: 84px;
      border-radius: 24px;
      background: #fff;
      display:flex;
      align-items:center;
      justify-content:center;
      box-shadow: 0 14px 30px rgba(31, 169, 113, 0.15);
    }
    ion-icon { font-size: 40px; color: var(--ion-color-primary); }
    h1, p { margin: 0; }
    p { color: #65808b; }
  `],
})
export class SplashPage {}
