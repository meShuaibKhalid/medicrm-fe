import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { Category } from '../../models/app.models';

@Component({
  selector: 'app-category-card',
  standalone: true,
  imports: [RouterLink, IonButton, IonIcon],
  template: `
    <ion-button class="category-card" fill="clear" [routerLink]="['/categories', category.slug, 'products']">
      <span>{{ category.name }}</span>
      <ion-icon name="chevron-down-outline"></ion-icon>
    </ion-button>
  `,
  styles: [`
    .category-card {
      --color: #222;
      --padding-start: 16px;
      --padding-end: 16px;
      --padding-top: 12px;
      --padding-bottom: 12px;
      margin: 0;
      border: 1px solid #e3e6ef;
      border-radius: 14px;
      text-transform: none;
      font-weight: 600;
      justify-content: space-between;
    }
    ion-icon {
      margin-left: 8px;
      color: var(--ion-color-primary);
      font-size: 18px;
    }
  `],
})
export class CategoryCardComponent {
  @Input({ required: true }) category!: Category;
}
