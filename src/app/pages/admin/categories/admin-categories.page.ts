import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonButton, IonContent, IonInput, IonItem, IonLabel, IonSelect, IonSelectOption, IonToggle, IonSearchbar } from '@ionic/angular/standalone';
import { CategoryService } from '../../../core/services/category.service';
import { AdminService } from '../../../core/services/admin.service';
import { Category } from '../../../shared/models/app.models';

@Component({ 
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, IonButton, IonContent, IonInput, IonItem, IonLabel, IonSelect, IonSelectOption, IonToggle, IonSearchbar],
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
                <th>Parent ID / Level</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let category of categories">
                <td><strong>{{ category.name }}</strong></td>
                <td><code>{{ category.slug }}</code></td>
                <td>
                  <span class="badge">{{ category.parentId || 'Parent' }}</span>
                  <span style="font-size: 0.8rem; color: #68818d; margin-left: 8px;">(Lvl {{ category.level }})</span>
                </td>
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
                <td colspan="5" style="text-align: center; color: #68818d;">No categories found.</td>
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
                <ion-item class="soft-card">
                  <ion-label position="stacked">Parent category</ion-label>
                  <ion-select [(ngModel)]="form.parentId">
                    <ion-select-option [value]="null">None</ion-select-option>
                    <ion-select-option *ngFor="let cat of parentCategories" [value]="cat.id">{{ cat.name }}</ion-select-option>
                  </ion-select>
                </ion-item>
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
      </div>
    </ion-content>
  `,
})
export class AdminCategoriesPage {
  private readonly categoryService = inject(CategoryService);
  private readonly adminService = inject(AdminService);
  categories: Category[] = [];
  parentCategories: Category[] = [];
  form: Partial<Category> = { isActive: true, level: 0, parentId: null };

  search = '';
  page = 1;
  limit = 10;
  totalItems = 0;
  totalPages = 1;

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
      this.parentCategories = categories.filter((category) => category.level === 0 || !category.parentId);
    });
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
    this.categoryDialog.nativeElement.showModal();
  }

  closeModal(): void {
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
    if (confirm('Are you sure you want to delete this category?')) {
      this.adminService.deleteCategory(id).subscribe(() => {
        this.load();
        this.loadParents();
      });
    }
  }

  resetForm(): void {
    this.form = { isActive: true, level: 0, parentId: null };
  }
}
