import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonAlert, IonButton, IonContent, IonInput, IonItem, IonLabel, IonToggle, IonSearchbar } from '@ionic/angular/standalone';
import { CategoryService } from '../../../core/services/category.service';
import { AdminService } from '../../../core/services/admin.service';
import { Category } from '../../../shared/models/app.models';

@Component({ 
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, IonAlert, IonButton, IonContent, IonInput, IonItem, IonLabel, IonToggle, IonSearchbar],
  template: `
    <ion-content>
      <div class="page-shell">
        <div class="section-title">
          <h2>Categories</h2>
          <ion-button size="small" (click)="openAddModal()">Add Category</ion-button>
        </div>

        <ion-searchbar placeholder="Search categories" [(ngModel)]="search" (ionInput)="page = 1; load()"></ion-searchbar>
        
        <div class="admin-table-wrapper">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let category of categories">
                <td><strong>{{ category.name }}</strong></td>
                <td><code>{{ category.slug }}</code></td>
                <td>
                  <span [class]="category.isActive ? 'text-success' : 'text-danger'">
                    {{ category.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="actions-cell">
                  <ion-button size="small" fill="outline" (click)="edit(category)">Edit</ion-button>
                  <ion-button size="small" fill="solid" color="danger" (click)="deleteCategory(category.id)">Delete</ion-button>
                </td>
              </tr>
              <tr *ngIf="categories.length === 0">
                <td colspan="4" style="text-align: center; color: #68818d;">No categories found.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination-controls" *ngIf="totalPages > 1">
          <ion-button size="small" fill="outline" [disabled]="page === 1" (click)="goToPage(page - 1)">Previous</ion-button>
          <span>Page {{ page }} of {{ totalPages }} (Total: {{ totalItems }})</span>
          <ion-button size="small" fill="outline" [disabled]="page === totalPages" (click)="goToPage(page + 1)">Next</ion-button>
        </div>

        <!-- Dialog Modal for Add/Edit Category -->
        <dialog #categoryDialog class="admin-modal">
          <div class="modal-header">
            <h3>{{ form.id ? 'Edit Category' : 'Add Category' }}</h3>
            <button (click)="closeModal()">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-stack">
              <div class="modal-grid-2">
                <ion-item class="soft-card">
                  <ion-label position="stacked">Name</ion-label>
                  <ion-input [(ngModel)]="form.name" placeholder="Category Name"></ion-input>
                </ion-item>
                <ion-item class="soft-card">
                  <ion-label position="stacked">Slug</ion-label>
                  <ion-input [(ngModel)]="form.slug" placeholder="category-slug"></ion-input>
                </ion-item>
              </div>

              <div class="modal-grid-2">
                <div class="category-picker soft-card">
                  <label class="field-label">Parent category</label>
                  <div class="category-dropdown">
                    <input
                      type="text"
                      [(ngModel)]="parentCategorySearch"
                      placeholder="Search parent categories"
                      class="category-search-input"
                      (focus)="openParentCategoryDropdown()"
                      (input)="openParentCategoryDropdown()"
                    />
                    <button
                      type="button"
                      class="category-toggle-btn"
                      (click)="toggleParentCategoryDropdown()"
                      aria-label="Toggle parent category dropdown"
                    >
                      {{ isParentCategoryDropdownOpen ? '▲' : '▼' }}
                    </button>
                  </div>
                  <div class="category-results" *ngIf="isParentCategoryDropdownOpen">
                    <button
                      type="button"
                      class="category-option"
                      [class.selected]="!form.parentId"
                      (click)="selectParentCategory(null)"
                    >
                      None
                    </button>
                    <button
                      *ngFor="let cat of filteredParentCategories"
                      type="button"
                      class="category-option"
                      [class.selected]="form.parentId === cat.id"
                      (click)="selectParentCategory(cat)"
                    >
                      {{ cat.name }}
                    </button>
                    <p class="category-empty" *ngIf="filteredParentCategories.length === 0">No parent categories found.</p>
                  </div>
                  <p class="selected-category" *ngIf="selectedParentCategoryLabel">Selected: {{ selectedParentCategoryLabel }}</p>
                </div>
                <ion-item class="soft-card" style="align-items: center; display: flex; height: 100%;">
                  <ion-label>Active</ion-label>
                  <ion-toggle [(ngModel)]="form.isActive"></ion-toggle>
                </ion-item>
              </div>

              <div style="margin-top: 16px; display: flex; gap: 12px; justify-content: flex-end;">
                <ion-button fill="outline" color="medium" (click)="closeModal()">Cancel</ion-button>
                <ion-button [disabled]="!form.name || !form.slug" (click)="save()">
                  {{ form.id ? 'Update Category' : 'Save Category' }}
                </ion-button>
              </div>
            </div>
          </div>
        </dialog>

        <ion-alert
          [isOpen]="isDeleteConfirmOpen"
          header="Delete Category"
          message="Are you sure you want to delete this category?"
          [buttons]="deleteConfirmButtons"
          (didDismiss)="closeDeleteConfirm()"
        ></ion-alert>
      </div>
    </ion-content>
  `,
  styles: [`
    .page-shell {
      padding-top: 50px;
    }

    .field-label {
      display: block;
      margin-bottom: 10px;
      color: #24404a;
      font-size: 0.95rem;
      font-weight: 600;
    }

    .category-picker {
      padding: 16px;
      border-radius: 20px;
      background: #fff;
    }

    .category-dropdown {
      position: relative;
      display: flex;
      align-items: center;
    }

    .category-search-input {
      width: 100%;
      min-height: 44px;
      border: 1px solid #d8e4ea;
      border-radius: 14px;
      background: #f5f8fa;
      color: #24404a;
      font: inherit;
      outline: none;
      padding: 0 44px 0 14px;
    }

    .category-search-input:focus {
      border-color: #0f8a6c;
      background: #fff;
    }

    .category-toggle-btn {
      position: absolute;
      right: 10px;
      border: 0;
      background: transparent;
      color: #55707a;
      cursor: pointer;
      font-size: 0.9rem;
      padding: 4px;
    }

    .category-results {
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-height: 240px;
      overflow-y: auto;
      margin-top: 8px;
      padding: 10px;
      border: 1px solid #d8e4ea;
      border-radius: 16px;
      background: #fff;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4);
    }

    .category-option {
      border: 1px solid #d8e4ea;
      border-radius: 14px;
      background: #f9fbfc;
      color: #24404a;
      cursor: pointer;
      font: inherit;
      padding: 10px 12px;
      text-align: left;
      transition: 0.2s ease;
    }

    .category-option.selected {
      border-color: #0f8a6c;
      background: #e8f7f1;
      color: #0f6c56;
    }

    .selected-category {
      margin: 10px 0 0;
      color: #55707a;
      font-size: 0.9rem;
    }

    .category-empty {
      margin: 0;
      color: #7b8d96;
      font-size: 0.9rem;
      padding: 10px 12px;
    }
  `],
})
export class AdminCategoriesPage {
  private readonly categoryService = inject(CategoryService);
  private readonly adminService = inject(AdminService);
  categories: Category[] = [];
  parentCategories: Category[] = [];
  form: Partial<Category> = { isActive: true, level: 0, parentId: null };
  parentCategorySearch = '';
  isParentCategoryDropdownOpen = false;

  search = '';
  page = 1;
  limit = 10;
  totalItems = 0;
  totalPages = 1;
  isDeleteConfirmOpen = false;
  private pendingDeleteCategoryId = '';

  @ViewChild('categoryDialog') categoryDialog!: ElementRef<HTMLDialogElement>;

  constructor() {
    this.load();
    this.loadParents();
  }

  load(): void {
    this.adminService.getAdminCategories({ search: this.search, page: this.page, limit: this.limit }).subscribe((res) => {
      this.categories = res.items;
      this.totalItems = res.pagination.total;
      this.totalPages = res.pagination.totalPages;
    });
  }

  loadParents(): void {
    this.categoryService.getCategories().subscribe((categories) => {
      this.parentCategories = categories
        .filter((category) => category.level === 0 || !category.parentId)
        .sort((a, b) => a.name.localeCompare(b.name));
    });
  }

  get filteredParentCategories(): Category[] {
    const term = this.parentCategorySearch.trim().toLowerCase();
    if (!term) return this.parentCategories;
    return this.parentCategories.filter((category) => category.name.toLowerCase().includes(term));
  }

  get selectedParentCategoryLabel(): string {
    if (!this.form.parentId) return 'None';
    const category = this.parentCategories.find((item) => item.id === this.form.parentId);
    return category ? category.name : 'None';
  }

  goToPage(p: number): void {
    this.page = p;
    this.load();
  }

  openAddModal(): void {
    this.resetForm();
    this.categoryDialog.nativeElement.showModal();
  }

  edit(category: Category): void {
    this.form = { ...category };
    this.populateParentCategorySearch();
    this.categoryDialog.nativeElement.showModal();
  }

  closeModal(): void {
    this.isParentCategoryDropdownOpen = false;
    this.categoryDialog.nativeElement.close();
  }

  save(): void {
    if (!this.form.name || !this.form.slug) return;
    
    const parent = this.categories.find(c => c.id === this.form.parentId);
    this.form.level = parent ? parent.level + 1 : 0;
    this.form.parentId = this.form.parentId || null;
    
    if (this.form.id) {
      this.adminService.updateCategory(this.form as Category).subscribe(() => {
        this.load();
        this.loadParents();
        this.closeModal();
        this.resetForm();
      });
    } else {
      this.adminService.createCategory(this.form as Category).subscribe(() => {
        this.load();
        this.loadParents();
        this.closeModal();
        this.resetForm();
      });
    }
  }

  deleteCategory(id: string): void {
    this.pendingDeleteCategoryId = id;
    this.isDeleteConfirmOpen = true;
  }

  resetForm(): void {
    this.form = { isActive: true, level: 0, parentId: null };
    this.parentCategorySearch = '';
    this.isParentCategoryDropdownOpen = false;
  }

  openParentCategoryDropdown(): void {
    this.isParentCategoryDropdownOpen = true;
  }

  toggleParentCategoryDropdown(): void {
    this.isParentCategoryDropdownOpen = !this.isParentCategoryDropdownOpen;
  }

  selectParentCategory(category: Category | null): void {
    this.form.parentId = category?.id ?? null;
    this.parentCategorySearch = category?.name ?? '';
    this.isParentCategoryDropdownOpen = false;
  }

  private populateParentCategorySearch(): void {
    const category = this.parentCategories.find((item) => item.id === this.form.parentId);
    this.parentCategorySearch = category?.name ?? '';
  }

  closeDeleteConfirm(): void {
    this.isDeleteConfirmOpen = false;
    this.pendingDeleteCategoryId = '';
  }

  get deleteConfirmButtons() {
    return [
      {
        text: 'Cancel',
        role: 'cancel' as const,
        handler: () => this.closeDeleteConfirm(),
      },
      {
        text: 'Delete',
        role: 'destructive' as const,
        handler: () => {
          const id = this.pendingDeleteCategoryId;
          this.closeDeleteConfirm();
          if (!id) return;
          this.adminService.deleteCategory(id).subscribe(() => {
            this.load();
            this.loadParents();
          });
        },
      },
    ];
  }
}
