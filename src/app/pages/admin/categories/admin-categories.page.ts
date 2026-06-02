import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonToggle,
  IonSearchbar,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonIcon,
} from '@ionic/angular/standalone';
import { CategoryService } from '../../../core/services/category.service';
import { AdminService } from '../../../core/services/admin.service';
import { Category } from '../../../shared/models/app.models';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonButton,
    IonContent,
    IonInput,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonToggle,
    IonSearchbar,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonIcon,
  ],
  template: `
    <ion-content class="categories-content">
      <div class="page-shell">
        <div class="top-bar">
          <h2 class="page-heading">Categories</h2>
          <button class="add-btn" (click)="openAddModal()">Add Category</button>
        </div>

        <ion-searchbar
          class="theme-search"
          placeholder="Search categories…"
          [(ngModel)]="search"
          (ionInput)="page = 1; load()"
          mode="md"
        >
        </ion-searchbar>

        <p class="section-label">All categories</p>

        <div class="cat-card" *ngFor="let category of categories">
          <!-- <div class="cat-icon">🏷️</div> -->
          <div class="cat-body">
            <div class="cat-name">{{ category.name }}</div>
            <div class="cat-slug">{{ category.slug }}</div>
            <div class="cat-tags">
              <span class="badge badge-parent" *ngIf="!category.parentId"
                >Parent</span
              >
              <span class="badge badge-child" *ngIf="category.parentId">{{
                category.parentId
              }}</span>
              <span class="badge badge-lvl">Lvl {{ category.level }}</span>
              <span class="badge badge-active" *ngIf="category.isActive"
                >Active</span
              >
              <span class="badge badge-inactive" *ngIf="!category.isActive"
                >Inactive</span
              >
            </div>
          </div>
          <div class="cat-actions">
            <button class="btn-edit" (click)="edit(category)">Edit</button>
            <button class="btn-delete" (click)="deleteCategory(category.id)">
              Delete
            </button>
          </div>
        </div>

        <div class="empty-state" *ngIf="categories.length === 0">
          <p>No categories found.</p>
        </div>

        <div class="pagination" *ngIf="totalPages > 1">
          <button
            class="pg-btn"
            [disabled]="page === 1"
            (click)="goToPage(page - 1)"
          >
            ← Prev
          </button>
          <span class="page-info"
            >Page <strong>{{ page }}</strong> of
            <strong>{{ totalPages }}</strong> · Total:
            <strong>{{ totalItems }}</strong></span
          >
          <button
            class="pg-btn"
            [disabled]="page === totalPages"
            (click)="goToPage(page + 1)"
          >
            Next →
          </button>
        </div>
      </div>

      <dialog #categoryDialog class="admin-modal">
        <div class="modal-head">
          <span class="modal-title">{{
            form.id ? 'Edit Category' : 'Add Category'
          }}</span>
          <button class="modal-close" (click)="closeModal()">×</button>
        </div>
        <div class="modal-body">
          <div class="grid2">
            <div class="field-group">
              <label class="field-label">Name</label>
              <ion-input
                class="field-input"
                [(ngModel)]="form.name"
                placeholder="Category name"
              ></ion-input>
            </div>
            <div class="field-group">
              <label class="field-label">Slug</label>
              <ion-input
                class="field-input"
                [(ngModel)]="form.slug"
                placeholder="category-slug"
              ></ion-input>
            </div>
          </div>
          <div class="grid2">
            <div class="field-group">
              <label class="field-label">Parent category</label>
              <ion-select class="field-input" [(ngModel)]="form.parentId">
                <ion-select-option [value]="null">None</ion-select-option>
                <ion-select-option
                  *ngFor="let cat of parentCategories"
                  [value]="cat.id"
                  >{{ cat.name }}</ion-select-option
                >
              </ion-select>
            </div>
            <div class="field-group">
              <label class="field-label">Status</label>
              <div class="toggle-row">
                <span class="toggle-label">Active</span>
                <ion-toggle
                  [(ngModel)]="form.isActive"
                  class="pink-toggle"
                ></ion-toggle>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <ion-button fill="clear" color="medium" (click)="closeModal()"
              >Cancel</ion-button
            >
            <ion-button
              shape="round"
              [disabled]="!form.name || !form.slug"
              (click)="save()"
            >
              {{ form.id ? 'Update Category' : 'Save Category' }}
            </ion-button>
          </div>
        </div>
      </dialog>
    </ion-content>
  `,
  styles: [
    `
      ion-toolbar {
        --background: #ffffff;
        --color: #2c1a22;
        ion-title {
          font-weight: 700;
          text-align: center;
        }
        ion-back-button {
          --color: #c94f7c;
        }
      }

      .page-shell {
        margin: 0 auto;
        padding: 20px 16px 32px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .top-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 6px;
      }
      .page-heading {
        font-size: 20px;
        font-weight: 700;
        color: #2c1a22;
        margin: 0;
      }
      .add-btn {
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 8px;
        font-weight: 700;
        font-size: 12px;
        letter-spacing: 0.03em;
        cursor: pointer;
      }

      .search-wrap {
        height: 44px;
        background: var(--color-white-near-white);
        border-radius: 10px;
        padding: 0 1.25rem;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
        border: 1px solid var(--color-soft-blue-gray);
        display: flex;
        justify-content: space-between;
        align-items: center;
        ion-icon {
          color: #c94f7c;
          font-size: 18px;
          flex-shrink: 0;
        }
        ion-input {
          --color: #2c1a22;
          --placeholder-color: #c0a0ad;
          font-size: 14px;
          --highlight-color: transparent;
        }
      }

      .section-label {
        font-size: 12px;
        font-weight: 700;
        color: #0ea87d;
        letter-spacing: 0.7px;
        text-transform: uppercase;
        margin-block: 0px;
        padding-left: 6px;
        display: block;
      }

      .theme-search {
        --background: #ffffff;
        --border-radius: 12px;
        --box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
        padding: 0;
      }

      .cat-card {
        gap: 14px;
        background: var(--color-white-near-white);
        border-radius: var(--app-border-radius-large, 18px);
        padding: 0.8rem 1.25rem;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
        border: 1px solid var(--color-soft-blue-gray);
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: box-shadow 0.2s;
      }
      .cat-icon {
        width: 44px;
        height: 44px;
        border-radius: 13px;
        background: #fbeaf0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        flex-shrink: 0;
      }
      .cat-body {
        flex: 1;
        min-width: 0;
      }
      .cat-name {
        font-size: 15px;
        font-weight: 700;
        color: #2c1a22;
        margin-bottom: 2px;
      }
      .cat-slug {
        font-size: 12px;
        color: #a0758c;
        font-family: monospace;
        margin-bottom: 6px;
      }
      .cat-tags {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
      }
      .badge {
        font-size: 10px;
        font-weight: 700;
        padding: 3px 9px;
        border-radius: 20px;
      }
      .badge-parent {
        background: #eff6ff;
        color: #1d4ed8;
      }
      .badge-child {
        background: #f5f3ff;
        color: #6d28d9;
      }
      .badge-lvl {
        background: #fdf0f4;
        color: #c94f7c;
      }
      .badge-active {
        background: #e6f7ee;
        color: #1e7a45;
      }
      .badge-inactive {
        background: #fee2e2;
        color: #b91c1c;
      }
      .cat-actions {
        display: flex;
        flex-direction: column;
        gap: 7px;
        flex-shrink: 0;
      }
      .btn-edit {
        padding: 8px;
        background: var(--ion-color-primary);
        color: #fff;
        font-size: 13px;
        font-weight: 600;
        border: none;
        border-radius: var(--app-border-radius-small, 8px);
        cursor: pointer;
        transition: background 0.18s;
        /* display: flex; */
        /* align-items: center; */
      }
      .btn-delete {
        background: #fee2e2;
        color: #b91c1c;
        border: none;
        border-radius: 8px;
        padding: 6px 14px;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
      }

      .pagination {
        background: #fff;
        border-radius: 16px;
        border: 1px solid #fae8ef;
        padding: 12px 18px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .page-info {
        font-size: 13px;
        color: #a0758c;
        strong {
          color: #2c1a22;
        }
      }
      .pg-btn {
        background: #fbeaf0;
        color: #c94f7c;
        border: none;
        border-radius: 20px;
        padding: 7px 16px;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        &:disabled {
          opacity: 0.4;
          cursor: default;
        }
      }

      // Modal
      .admin-modal {
        // border: none;
        // border-radius: 24px;
        // width: 100%;
        // max-width: 520px;
        // box-shadow: 0 8px 40px rgba(201, 79, 124, 0.18);
        // padding: 0;
        // &::backdrop {
        //   background: rgba(44, 26, 34, 0.35);
        // }
      }
      .modal-head {
        padding: 18px 22px 14px;
        border-bottom: 1px solid #fae8ef;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .modal-title {
        font-size: 16px;
        font-weight: 700;
        color: #000;
      }
      .modal-close {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: #079e6f;
        border: none;
        cursor: pointer;
        font-size: 20px;
        color: #fff;
      }
      .modal-body {
        padding: 20px 22px;
      }
      .grid2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-bottom: 12px;
      }
      .field-label {
        font-size: 11px;
        font-weight: 700;
        color: #0aa674;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        display: block;
        margin-bottom: 5px;
      }
      .field-input {
        background: #ffffff;
        border: 1.5px solid #fae8ef;
        border-radius: 12px;
        --padding-start: 14px;
        color: #000000;
        font-size: 14px;
      }
      .toggle-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 11px 14px;
        background: #fff;
        border: 1.5px solid #fae8ef;
        border-radius: 12px;
      }
      .toggle-label {
        font-size: 14px;
        color: #2c1a22;
        font-weight: 500;
      }
      .pink-toggle {
        --track-background-checked: #0eb27c;
        --handle-background-checked: #fff;
      }
      .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 18px;
      }
    `,
  ],
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
    this.adminService
      .getAdminCategories({
        search: this.search,
        page: this.page,
        limit: this.limit,
      })
      .subscribe((res) => {
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

    const parent = this.categories.find((c) => c.id === this.form.parentId);
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
