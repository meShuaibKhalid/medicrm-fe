import { Component, Input } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [IonIcon],
  template: `
    <div class="empty-state">
      <ion-icon [name]="icon"></ion-icon>
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
    </div>
  `,
  styles: [`
    .empty-state {
      padding: 32px 18px;
      text-align: center;
      color: #5f7882;
      background: #fff;
      border-radius: 20px;
      box-shadow: 0 10px 24px rgba(23, 61, 82, 0.08);
    }
    ion-icon { font-size: 42px; color: var(--ion-color-secondary); }
    h3 { margin: 12px 0 6px; color: #173d52; }
    p { margin: 0; }
  `],
})
export class EmptyStateComponent {
  @Input() title = 'Nothing here yet';
  @Input() message = 'Content will appear here when available.';
  @Input() icon = 'cube-outline';
}
