import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonButton, IonContent, IonInput, IonItem, IonLabel, IonList, IonSelect, IonSelectOption, IonToggle } from '@ionic/angular/standalone';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../shared/models/app.models';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, IonButton, IonContent, IonInput, IonItem, IonLabel, IonList, IonSelect, IonSelectOption, IonToggle],
  template: `
    <ion-content>
      <div class="page-shell">
        <div class="section-title"><h2>Categories</h2></div>
        <ion-list class="soft-card">
          <ion-item *ngFor="let category of categories">
            <ion-label>
              <h2>{{ category.name }}</h2>
              <p>{{ category.slug }} · {{ category.parentId || 'Parent' }} · {{ category.isActive ? 'Active' : 'Inactive' }}</p>
              <div>
                <ion-button size="small" fill="clear" (click)="edit(category)">Edit</ion-button>
                <ion-button size="small" fill="clear" color="danger">Delete</ion-button>
              </div>
            </ion-label>
          </ion-item>
        </ion-list>

        <div class="form-stack">
          <ion-item class="soft-card"><ion-label position="stacked">Name</ion-label><ion-input [(ngModel)]="form.name"></ion-input></ion-item>
          <ion-item class="soft-card"><ion-label position="stacked">Slug</ion-label><ion-input [(ngModel)]="form.slug"></ion-input></ion-item>
          <ion-item class="soft-card">
            <ion-label position="stacked">Parent category</ion-label>
            <ion-select [(ngModel)]="form.parentId">
              <ion-select-option [value]="null">None</ion-select-option>
              <ion-select-option *ngFor="let category of parentCategories" [value]="category.id">{{ category.name }}</ion-select-option>
            </ion-select>
          </ion-item>
          <ion-item class="soft-card"><ion-label>Active</ion-label><ion-toggle [(ngModel)]="form.isActive"></ion-toggle></ion-item>
          <ion-button expand="block" shape="round">Save Category</ion-button>
        </div>
      </div>
    </ion-content>
  `,
})
export class AdminCategoriesPage {
  private readonly categoryService = inject(CategoryService);
  categories: Category[] = [];
  parentCategories: Category[] = [];
  form: Partial<Category> = { isActive: true, level: 0, parentId: null };

  constructor() {
    this.categoryService.getCategories().subscribe((categories) => {
      this.categories = categories;
      this.parentCategories = categories.filter((category) => category.level === 0);
    });
  }

  edit(category: Category): void {
    this.form = { ...category };
  }
}
