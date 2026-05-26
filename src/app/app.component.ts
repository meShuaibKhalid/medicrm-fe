import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet, IonIcon } from '@ionic/angular/standalone';
import { HeaderComponent } from './shared/components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: 'app.component.html',
  styleUrl: 'app.component.scss',
  imports: [IonApp, IonRouterOutlet, HeaderComponent, IonIcon],
})
export class AppComponent {}
