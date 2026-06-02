import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { Category } from '../../models/app.models';

@Component({
  selector: 'app-category-card',
  standalone: true,
  imports: [RouterLink, IonIcon],
  template: `
    <button class="category-card" fill="clear" [routerLink]="['/categories', category.slug, 'products']">
      <span>{{ category.name }}</span>
      <ion-icon name="chevron-down-outline"></ion-icon>
    </button>
  `,
  styles: [`
    .category-card {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: row;
      flex-wrap: nowrap;
      font-size: 13px;
      text-decoration: none;
      color: inherit;
      text-transform: capitalize;
      padding: 15px 0 8px;
      width: 100%;
      background: transparent;
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
