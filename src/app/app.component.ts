import { Component, OnDestroy } from '@angular/core';
import { IonApp, IonIcon, IonRouterOutlet } from '@ionic/angular/standalone';
import { HeaderComponent } from './shared/components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: 'app.component.html',
  styleUrl: 'app.component.scss',
  imports: [IonApp, IonRouterOutlet, HeaderComponent, IonIcon],
})
export class AppComponent implements OnDestroy {
  private readonly onBackButton = (event: Event) => {
    const customEvent = event as CustomEvent<{ register: (priority: number, handler: () => void) => void }>;
    customEvent.detail.register(10, () => {
      if (window.history.length > 1) {
        window.history.back();
      }
    });
  };

  constructor() {
    document.addEventListener('ionBackButton', this.onBackButton as EventListener);
  }

  ngOnDestroy(): void {
    document.removeEventListener('ionBackButton', this.onBackButton as EventListener);
  }
}
