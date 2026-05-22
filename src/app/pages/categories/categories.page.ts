import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonSearchbar, IonToolbar } from '@ionic/angular/standalone';
import { CategoryService } from '../../core/services/category.service';
import { Category } from '../../shared/models/app.models';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IonButton, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonSearchbar, IonToolbar],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar class="dvago-toolbar">
        <div class="page-shell category-topbar">
          <div class="brand-block">
            <h1>DVAGO</h1>
            <span>Pharmacy & Wellness Experts</span>
          </div>
          <ion-searchbar class="dvago-searchbar" placeholder='Search for "Personal Care"' [(ngModel)]="searchTerm" (ngModelChange)="onSearchChange()"></ion-searchbar>
        </div>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="page-shell categories-shell">
        <div class="parent-nav">
          <ion-button
            *ngFor="let category of filteredParents"
            fill="clear"
            class="parent-link"
            [class.active]="selectedParent?.id === category.id"
            (click)="selectParent(category)">
            {{ category.name }}
            <ion-icon slot="end" name="chevron-down-outline"></ion-icon>
          </ion-button>
        </div>

        <div class="dvago-breadcrumb">
          <span>Home</span>
          <ion-icon name="chevron-forward-outline"></ion-icon>
          <span>{{ selectedParent?.name || 'Categories' }}</span>
        </div>

        <div class="section-title"><h2>{{ selectedParent?.name || 'Categories' }}</h2></div>

        <div class="category-layout">
          <div class="subcat-strip">
            <button class="dvago-outlined-chip" *ngFor="let child of selectedChildren" [routerLink]="['/categories', child.slug, 'products']">
              {{ child.name }}
            </button>
          </div>

          <ion-list class="soft-card flyout-list" *ngIf="selectedChildren.length">
            <ion-item *ngFor="let child of selectedChildren" [routerLink]="['/categories', child.slug, 'products']">
              <ion-icon slot="start" name="chevron-back-outline"></ion-icon>
              <ion-label>{{ child.name }}</ion-label>
            </ion-item>
          </ion-list>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .category-topbar {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
      align-items: center;
    }
    .brand-block h1 {
      margin: 0;
      font-size: 2.2rem;
      font-weight: 800;
      letter-spacing: -.04em;
      color: var(--ion-color-primary);
    }
    .brand-block span {
      display: block;
      color: var(--ion-color-primary);
      font-size: .82rem;
      font-weight: 600;
    }
    .categories-shell {
      padding-top: 8px;
    }
    .parent-nav {
      display: flex;
      gap: 12px;
      overflow-x: auto;
      overflow-y: hidden;
      padding-bottom: 6px;
      touch-action: pan-x;
      -webkit-overflow-scrolling: touch;
    }
    .parent-nav::-webkit-scrollbar {
      display: none;
    }
    .parent-link {
      --color: #222;
      text-transform: none;
      border-radius: 12px;
      border: 1px solid transparent;
      min-width: max-content;
      font-weight: 600;
    }
    .parent-link.active {
      --color: var(--ion-color-secondary);
      border-color: var(--ion-color-secondary);
    }
    .category-layout {
      display:grid;
      gap:24px;
      align-items: start;
    }
    .subcat-strip {
      display: flex;
      gap: 14px;
      overflow-x: auto;
      overflow-y: hidden;
      padding-bottom: 6px;
      touch-action: pan-x;
      -webkit-overflow-scrolling: touch;
    }
    .subcat-strip::-webkit-scrollbar {
      display: none;
    }
    .flyout-list {
      overflow: hidden;
      border-radius: 20px;
      max-width: 320px;
      justify-self: end;
      width: 100%;
    }
    .flyout-list ion-item {
      --padding-start: 18px;
      --padding-end: 18px;
      --min-height: 56px;
    }
    .flyout-list ion-icon {
      color: var(--ion-color-primary);
    }
    @media (min-width: 992px) {
      .category-topbar {
        grid-template-columns: 260px minmax(320px, 520px);
      }
      .category-layout {
        grid-template-columns: minmax(0, 1fr) 320px;
      }
    }
  `],
})
export class CategoriesPage {
  private readonly categoryService = inject(CategoryService);
  parentCategories: Category[] = [];
  allCategories: Category[] = [];
  selectedParent?: Category;
  selectedChildren: Category[] = [];
  searchTerm = '';

  constructor() {
    this.categoryService.getCategoryTree().subscribe((categories) => {
      this.allCategories = categories;
      this.parentCategories = categories;
      this.selectParent(categories[0]);
    });
  }

  get filteredParents(): Category[] {
    const term = this.searchTerm.toLowerCase();
    if (!term) {
      return this.parentCategories;
    }

    return this.parentCategories.filter((category) =>
      category.name.toLowerCase().includes(term) ||
      (category.children ?? []).some((child) => child.name.toLowerCase().includes(term)),
    );
  }

  selectParent(category?: Category): void {
    this.selectedParent = category;
    const children = category?.children ?? [];
    const term = this.searchTerm.toLowerCase();
    this.selectedChildren = term ? children.filter((child) => child.name.toLowerCase().includes(term)) : children;
  }

  onSearchChange(): void {
    const nextParent = this.selectedParent && this.filteredParents.some((category) => category.id === this.selectedParent?.id)
      ? this.selectedParent
      : this.filteredParents[0];
    this.selectParent(nextParent);
  }
}
