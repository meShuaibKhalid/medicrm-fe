import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  inject,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonSearchbar,
  IonTextarea,
  IonToggle,
  IonModal,
} from '@ionic/angular/standalone';
import { ProductService } from '../../../core/services/product.service';
import { AdminService } from '../../../core/services/admin.service';
import { CategoryService } from '../../../core/services/category.service';
import { Brand, Product, Category } from '../../../shared/models/app.models';
import { BrandService } from '../../../core/services/brand.service';
import { toSlug } from '../../../shared/utils/slug';
import { IonAlert } from '@ionic/angular/standalone';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonAlert,
    IonButton,
    IonContent,
    IonSearchbar,
    IonInput,
    IonItem,
    IonLabel,
    IonTextarea,
    IonToggle,
    IonIcon,
    IonModal,
  ],
  template: `
    <ion-content>
      <div class="page-shell">
        <div class="section-title">
          <h2>Products</h2>
          <button size="small" class="add-btn" (click)="openAddModal()">
            Add Product
          </button>
        </div>
        <ion-searchbar
          placeholder="Search products"
          class="theme-search"
          [(ngModel)]="search"
          (ionInput)="onSearchInput()"
        ></ion-searchbar>

        <div class="admin-table-wrapper">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Brand</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let product of products">
                <td>
                  <strong>{{ product.title }}</strong>
                </td>
                <td>{{ product.brand }}</td>
                <td>
                  Rs. {{ product.salePrice ?? product.price | number: '1.0-2' }}
                </td>
                <td>{{ product.stock }}</td>
                <td>
                  <span
                    [class]="product.isActive ? 'text-success' : 'text-danger'"
                  >
                    {{ product.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="actions-cell">
                  <ion-button
                    size="small"
                    fill="outline"
                    (click)="edit(product)"
                  >
                    Edit
                  </ion-button>
                  <ion-button
                    size="small"
                    fill="solid"
                    color="danger"
                    (click)="deleteProduct(product.id)"
                  >
                    Delete
                  </ion-button>
                </td>
              </tr>
              <tr *ngIf="products.length === 0">
                <td colspan="6" style="text-align: center; color: #68818d;">
                  No products found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination-controls" *ngIf="totalPages > 1">
          <ion-button
            size="small"
            fill="outline"
            [disabled]="page === 1"
            (click)="goToPage(page - 1)"
            >Previous</ion-button
          >
          <span
            >Page {{ page }} of {{ totalPages }} (Total: {{ totalItems }})</span
          >
          <ion-button
            size="small"
            fill="outline"
            [disabled]="page === totalPages"
            (click)="goToPage(page + 1)"
            >Next</ion-button
          >
        </div>
        <ion-modal
          #productDialog
          [isOpen]="isModalOpen"
          (didDismiss)="isModalOpen = false"
        >
          <ng-template>
            <div class="modal-head">
              <span class="modal-title">{{
                form.value.id ? 'Edit Product' : 'Add Product'
              }}</span>
              <button class="modal-close" (click)="closeModal()">×</button>
            </div>
            <div class="modal-body">
              <form [formGroup]="form" class="form-stack">
                <div class="modal-grid-2">
                  <div class="field-group">
                    <label class="field-label">Title *</label>
                    <ion-input
                      class="field-input"
                      formControlName="title"
                      placeholder="Product Title"
                      (ionInput)="onTitleInput()"
                    ></ion-input>
                  </div>
                  <div class="field-group">
                    <label class="field-label">Slug *</label>
                    <ion-input
                      class="field-input"
                      formControlName="slug"
                      placeholder="product-slug"
                      (ionInput)="onSlugInput()"
                    ></ion-input>
                  </div>
                </div>

                <div class="modal-grid-2">
                  <div class="field-group searchable-field">
                    <label class="field-label">Brand</label>
                    <ion-input
                      class="field-input category-search-input"
                      [value]="brandSearch"
                      placeholder="Search brand"
                      (ionInput)="onBrandSearch($event)"
                      (ionFocus)="openBrandDropdown()"
                    ></ion-input>
                    <button
                      type="button"
                      class="category-toggle-btn"
                      (click)="toggleBrandDropdown()"
                    >
                      ▾
                    </button>
                    <div class="category-results" *ngIf="isBrandDropdownOpen">
                      <button
                        type="button"
                        class="category-option"
                        [class.selected]="!form.value.brandId"
                        (click)="selectBrand(null)"
                      >
                        No Brand
                      </button>
                      <button
                        type="button"
                        class="category-option"
                        *ngFor="let brand of filteredBrands"
                        [class.selected]="form.value.brandId === brand.id"
                        (click)="selectBrand(brand)"
                      >
                        {{ brand.name }}
                      </button>
                      <p class="category-empty" *ngIf="filteredBrands.length === 0">
                        No matching brands.
                      </p>
                    </div>
                  </div>

                  <div class="field-group searchable-field">
                    <label class="field-label">Category *</label>
                    <ion-input
                      class="field-input category-search-input"
                      [value]="categorySearch"
                      placeholder="Search category"
                      (ionInput)="onCategorySearch($event)"
                      (ionFocus)="openCategoryDropdown()"
                    ></ion-input>
                    <button
                      type="button"
                      class="category-toggle-btn"
                      (click)="toggleCategoryDropdown()"
                    >
                      ▾
                    </button>
                    <div class="category-results" *ngIf="isCategoryDropdownOpen">
                      <button
                        type="button"
                        class="category-option"
                        *ngFor="let category of filteredCategories"
                        [class.selected]="form.value.primaryCategoryId === category.id"
                        (click)="selectCategory(category.id)"
                      >
                        {{ category.name }}
                      </button>
                      <p class="category-empty" *ngIf="filteredCategories.length === 0">
                        No matching categories.
                      </p>
                    </div>
                  </div>
                </div>

                <div class="modal-grid-2">
                  <div class="field-group">
                    <label class="field-label">Price *</label>
                    <ion-input
                      class="field-input"
                      type="number"
                      formControlName="price"
                      placeholder="Rs. 0.00"
                    ></ion-input>
                  </div>
                  <div class="field-group">
                    <label class="field-label">Sale Price</label>
                    <ion-input
                      class="field-input"
                      type="number"
                      formControlName="salePrice"
                      placeholder="Rs. 0.00"
                    ></ion-input>
                  </div>
                </div>

                <div class="modal-grid-2">
                  <div class="field-group">
                    <label class="field-label">Sale Percent</label>
                    <ion-input
                      class="field-input"
                      type="number"
                      formControlName="salePercent"
                      placeholder="0"
                    ></ion-input>
                  </div>
                  <div class="field-group">
                    <label class="field-label">Stock</label>
                    <ion-input
                      class="field-input"
                      type="number"
                      formControlName="stock"
                      placeholder="0"
                    ></ion-input>
                  </div>
                </div>

                <div class="modal-grid-2">
                  <div class="field-group">
                    <label class="field-label">Max Order</label>
                    <ion-input
                      class="field-input"
                      type="number"
                      formControlName="maxOrder"
                      placeholder="10"
                    ></ion-input>
                  </div>
                  <div class="field-group">
                    <label class="field-label">Used For</label>
                    <ion-input
                      class="field-input"
                      formControlName="usedFor"
                      placeholder="Fever, pain, etc."
                    ></ion-input>
                  </div>
                </div>

                <div class="field-group image-upload-card">
                  <label class="field-label">Product Image</label>
                  <input
                    class="field-input"
                    type="file"
                    accept="image/*"
                    (change)="onImageSelected($event)"
                  />
                  <p class="selected-file" *ngIf="selectedImageName">
                    {{ selectedImageName }}
                  </p>
                  <div class="image-preview" *ngIf="imagePreviewUrl">
                    <img
                      [src]="imagePreviewUrl"
                      [alt]="form.value.title || 'Product image preview'"
                    />
                  </div>
                </div>

                <div class="field-group">
                  <label class="field-label">Description</label>
                  <ion-textarea
                    class="field-input"
                    formControlName="description"
                    rows="3"
                    placeholder="Enter product description..."
                  ></ion-textarea>
                </div>

                <div class="modal-grid-2">
                  <div
                    class="field-group"
                    style="align-items: center; display: flex; height: 100%;"
                  >
                    <label>Prescription Required</label>
                    <ion-toggle
                      formControlName="prescriptionRequired"
                    ></ion-toggle>
                  </div>
                  <div
                    class="field-group"
                    style="align-items: center; display: flex; height: 100%;"
                  >
                    <label>Active</label>
                    <ion-toggle formControlName="isActive"></ion-toggle>
                  </div>
                </div>

                <div
                  style="margin-top: 16px; display: flex; gap: 12px; justify-content: flex-end;"
                >
                  <ion-button
                    fill="outline"
                    color="medium"
                    (click)="closeModal()"
                    >Cancel</ion-button
                  >
                  <ion-button [disabled]="form.invalid" (click)="save()">
                    {{ form.value.id ? 'Update Product' : 'Save Product' }}
                  </ion-button>
                </div>
              </form>
            </div>
          </ng-template>
        </ion-modal>

        <ion-alert
          [isOpen]="isDeleteConfirmOpen"
          header="Delete Product"
          message="Are you sure you want to delete this product?"
          [buttons]="deleteConfirmButtons"
          (didDismiss)="closeDeleteConfirm()"
        ></ion-alert>
      </div>

      <div class="empty-state-row" *ngIf="products.length === 0">
        <p>No products found.</p>
      </div>
    </ion-content>
  `,
  styles: [
    `
      .page-shell {
        margin: 0 auto;
        padding: 20px 16px 32px;
        display: flex;
        flex-direction: column;
        gap: 14px;
        .section-title {
          margin: 0;
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
            text-transform: capitalize;
          }
        }
      }

      .field-label {
        display: block;
        margin-bottom: 10px;
        color: #24404a;
        font-size: 0.95rem;
        font-weight: 600;
      }

      .category-picker,
      .image-upload-card {
        padding: 16px;
        border-radius: 20px;
        background: #fff;
      }

      .category-search {
        --background: #f5f8fa;
        --box-shadow: none;
        padding-inline: 0;
      }

      .category-picker {
        position: relative;
        z-index: 5;
      }

      .category-dropdown {
        position: relative;
        display: flex;
        align-items: center;
        flex-direction: column;
        gap: 7px;
        flex-shrink: 0;
      }

      // FIX 1: .btn-action-edit was missing its closing brace,
      // causing .btn-action-delete to be nested inside it.
      .btn-action-edit {
        padding: 8px;
        background: var(--ion-color-primary);
        color: #fff;
        font-size: 13px;
        font-weight: 600;
        border: none;
        border-radius: var(--app-border-radius-small, 8px);
        cursor: pointer;

        &:hover {
          background: #d0f0e5;
        }
      } // <-- was missing

      .btn-action-delete {
        background: #fee2e2;
        color: #b91c1c;
        border: none;
        border-radius: 8px;
        padding: 6px 14px;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;

        &:hover {
          background: #fee2e2;
        }
      }

      .theme-search {
        --background: #ffffff;
        --border-radius: 12px;
        --box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
        padding: 0;
      }

      // Fallback Container rows
      .empty-state-row {
        padding: 40px;
        text-align: center;
        color: #6b7280;
        font-size: 14px;
      }

      // Footer Component configurations
      .pagination-footer {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 20px;
        margin-top: 24px;

        .page-nav {
          background: white;
          border: 1px solid #e5e7eb;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 5px;
          cursor: pointer;

          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        }

        .page-info {
          font-size: 13px;
          color: #6b7280;
        }
      }

      // Responsive layout breakpoint rules
      @media (max-width: 680px) {
        .product-list-item {
          flex-direction: column;
          align-items: flex-start;
          gap: 16px;
        }

        .product-actions-block {
          width: 100%;

          .btn-action-edit,
          .btn-action-delete {
            flex: 1;
            text-align: center;
          }
        }
      }

      // Modal Shell Configuration matching exact dimensions and border radii
      dialog.admin-modal.matching-theme {
        border: none;
        border-radius: 28px;
        padding: 0;
        width: 90%;
        max-width: 740px;
        background: #ffffff;
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.08);
        overflow: hidden;

        &::backdrop {
          background: rgba(15, 23, 42, 0.15);
          backdrop-filter: blur(4px);
        }
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
        overflow: visible;
        max-height: 72vh;
        overflow-y: auto;
      }
      .field-group {
        position: relative;
        overflow: visible;
        z-index: 1;
      }

      .searchable-field {
        z-index: 30;
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

      .modal-action-footer {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 24px;
        button {
          width: auto !important;
        }
      }

      // Content scroll restrictions to protect modal aspect ratios
      .modal-body-scroll {
        max-height: 72vh;
        overflow-y: auto;
        padding: 24px;
        background: #fff;

        &::-webkit-scrollbar {
          width: 6px;
        }

        &::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
      }

      // 2-Column form grid mapping layout instructions
      .modal-grid-2 {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px 20px;
        margin-bottom: 16px;
      }

      .full-width-field {
        margin-bottom: 16px;
      }

      // Structural Typography & Input Elements
      .form-field-group {
        display: flex;
        flex-direction: column;
        gap: 6px;

        .form-field-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.04em;
          color: #00a878;
        }

        // FIX 2: .custom-input-box was never closed, swallowing all
        // the category/image classes below as unintended children.
        .custom-input-box {
          background: #ffffff;
          border: 1px solid #f2f4f6;
          border-radius: 12px;
          padding: 2px 14px;
          transition:
            border-color 0.2s,
            box-shadow 0.2s;

          &:focus-within {
            border-color: #00a878;
          }
        } // <-- was missing
      }

      // FIX 3: These are all siblings of .form-field-group,
      // not children of .custom-input-box.
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

        &:focus {
          border-color: #0f8a6c;
          background: #fff;
        }
      }

      .category-toggle-btn {
        position: absolute;
        right: 10px;
        top: 40%;
        border-radius: 8px;
        background: white;
        color: #55707a;
        cursor: pointer;
        font-size: 0.9rem;
        padding: 10px;
        z-index: 50;
      }

      .category-results {
        position: absolute;
        top: calc(100% + 8px);
        left: 0;
        right: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
        max-height: 240px;
        overflow-y: auto;
        padding: 10px;
        border: 1px solid #d8e4ea;
        border-radius: 16px;
        background: #fff;
        box-shadow: 0 16px 30px rgba(15, 34, 48, 0.14);
        z-index: 50;
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

        &.selected {
          border-color: #0f8a6c;
          background: #e8f7f1;
          color: #0f6c56;
        }
      }

      .selected-category,
      .selected-file {
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

      .image-upload-card {
        input[type='file'] {
          display: block;
          width: 100%;
          padding: 10px 12px;
        }
      }

      .image-preview {
        margin-top: 12px;

        img {
          width: 160px;
          height: 160px;
          object-fit: contain;
          border-radius: 16px;
          background: #f6f8fa;
          border: 1px solid #d8e4ea;
          padding: 10px;
        }
      }
    `,
  ],
})
export class AdminProductsPage implements OnDestroy {
  private readonly adminService = inject(AdminService);
  private readonly categoryService = inject(CategoryService);
  private readonly brandService = inject(BrandService);
  private readonly fb = inject(FormBuilder);
  private searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  isModalOpen = false;
  search = '';
  products: Product[] = [];
  categories: Category[] = [];
  brands: Brand[] = [];
  categorySearch = '';
  brandSearch = '';
  isCategoryDropdownOpen = false;
  isBrandDropdownOpen = false;
  imagePreviewUrl = '';
  selectedImageName = '';
  private selectedImageFile: File | null = null;
  private imageObjectUrl: string | null = null;
  private autoSlugValue = '';
  private slugManuallyEdited = false;

  page = 1;
  limit = 10;
  totalItems = 0;
  totalPages = 1;
  isDeleteConfirmOpen = false;
  private pendingDeleteProductId = '';

  form = this.fb.group({
    id: [''],
    title: ['', Validators.required],
    slug: [''],
    brandId: [''],
    brand: [''],
    description: [''],
    image: [''],
    price: [0, Validators.required],
    salePrice: [0],
    salePercent: [0],
    stock: [0],
    maxOrder: [10],
    primaryCategoryId: ['', Validators.required],
    usedFor: [''],
    prescriptionRequired: [false],
    isActive: [true],
  });

  @ViewChild('productDialog') productDialog!: ElementRef<HTMLDialogElement>;

  constructor() {
    this.load();
    this.categoryService.getCategories().subscribe((categories) => {
      this.categories = categories.sort((a, b) => a.name.localeCompare(b.name));
    });
    this.brandService.getBrands().subscribe((brands) => {
      this.brands = brands.sort((a, b) => a.name.localeCompare(b.name));
    });
  }

  ngOnDestroy(): void {
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
      this.searchDebounceTimer = null;
    }
    this.revokeImageObjectUrl();
  }

  get filteredCategories(): Category[] {
    const term = this.categorySearch.trim().toLowerCase();
    if (!term) return this.categories;
    return this.categories.filter((category) =>
      category.name.toLowerCase().includes(term),
    );
  }

  get filteredBrands(): Brand[] {
    const term = this.brandSearch.trim().toLowerCase();
    if (!term) return this.brands;
    return this.brands.filter((brand) =>
      brand.name.toLowerCase().includes(term),
    );
  }

  get selectedCategoryLabel(): string {
    const selectedId = this.form.value.primaryCategoryId;
    if (!selectedId) return '';
    const category = this.categories.find((item) => item.id === selectedId);
    return category ? category.name : '';
  }

  onSearchInput(): void {
    this.page = 1;
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
    this.searchDebounceTimer = setTimeout(() => {
      this.load();
    }, 250);
  }

  load(): void {
    this.adminService
      .getAdminProducts({
        search: this.search,
        page: this.page,
        limit: this.limit,
      })
      .subscribe((res) => {
        this.products = res.items;
        this.totalItems = res.pagination.total;
        this.totalPages = res.pagination.totalPages;
      });
  }

  goToPage(p: number): void {
    this.page = p;
    this.load();
  }

  openAddModal(): void {
    this.resetForm();
    const dialog = this.productDialog?.nativeElement;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
    this.isModalOpen = true;
  }

  edit(product: Product): void {
    this.form.patchValue({
      id: product.id,
      title: product.title,
      slug: product.slug,
      brandId: product.brandId || '',
      brand: '',
      description: product.description,
      image: product.image,
      price: product.price,
      salePrice: product.salePrice,
      salePercent: product.salePercent,
      stock: product.stock,
      maxOrder: product.maxOrder,
      primaryCategoryId: product.primaryCategoryId || '',
      usedFor: product.usedFor,
      prescriptionRequired: product.prescriptionRequired,
      isActive: product.isActive,
    });
    this.autoSlugValue = '';
    this.slugManuallyEdited = false;
    this.selectedImageFile = null;
    this.selectedImageName = '';
    this.setImagePreview(product.image || '');
    this.populateCategorySearch(product.primaryCategoryId || '');
    this.populateBrandSearch(product.brandId || '');
    const dialog = this.productDialog?.nativeElement;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isCategoryDropdownOpen = false;
    this.isBrandDropdownOpen = false;
    // const dialog = this.productDialog?.nativeElement;
    // if (dialog?.open) {
    //   dialog.close();
    // }
    this.isModalOpen = false;
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const payload = this.buildProductFormData();
    const request = value.id
      ? this.adminService.updateProduct(payload, value.id || '')
      : this.adminService.createProduct(payload);
    request.subscribe(() => {
      this.load();
      this.closeModal();
      this.resetForm();
    });
  }

  deleteProduct(id: string): void {
    this.pendingDeleteProductId = id;
    this.isDeleteConfirmOpen = true;
  }

  resetForm(): void {
    this.form.reset({
      id: '',
      title: '',
      slug: '',
      brandId: '',
      brand: '',
      description: '',
      image: '',
      price: 0,
      salePrice: 0,
      salePercent: 0,
      stock: 0,
      maxOrder: 10,
      primaryCategoryId: '',
      usedFor: '',
      prescriptionRequired: false,
      isActive: true,
    });
    this.autoSlugValue = '';
    this.slugManuallyEdited = false;
    this.selectedImageFile = null;
    this.selectedImageName = '';
    this.categorySearch = '';
    this.brandSearch = '';
    this.isCategoryDropdownOpen = false;
    this.isBrandDropdownOpen = false;
    this.setImagePreview('');
  }

  selectCategory(id: any): void {
    const category = this.categories.find((item) => item.id === String(id));
    this.form.patchValue({ primaryCategoryId: String(id) });
    this.categorySearch = category?.name || '';
    this.isCategoryDropdownOpen = false;
  }

  selectBrand(brand: Brand | null): void {
    this.form.patchValue({ brandId: brand?.id || '' });
    this.brandSearch = brand?.name || '';
    this.isBrandDropdownOpen = false;
  }

  onBrandSearch(event: Event): void {
    const value = (event.target as HTMLInputElement)?.value || '';
    this.brandSearch = value;
    if (!value) this.form.patchValue({ brandId: '' });
    this.isBrandDropdownOpen = true;
  }

  onCategorySearch(event: Event): void {
    const value = (event.target as HTMLInputElement)?.value || '';
    this.categorySearch = value;
    if (!value) this.form.patchValue({ primaryCategoryId: '' });
    this.isCategoryDropdownOpen = true;
  }

  openCategoryDropdown(): void {
    this.isCategoryDropdownOpen = true;
  }

  toggleCategoryDropdown(): void {
    this.isCategoryDropdownOpen = !this.isCategoryDropdownOpen;
  }

  openBrandDropdown(): void {
    this.isBrandDropdownOpen = true;
  }

  toggleBrandDropdown(): void {
    this.isBrandDropdownOpen = !this.isBrandDropdownOpen;
  }

  async onImageSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (!file) {
      this.selectedImageFile = null;
      this.selectedImageName = '';
      this.setImagePreview(this.form.value.image || '');
      input.value = '';
      return;
    }

    const compressed = await this.compressImage(file);
    this.selectedImageFile = compressed;
    this.selectedImageName = `${file.name} (${Math.round(compressed.size / 1024)} KB)`;
    this.setImagePreview(URL.createObjectURL(compressed));
    input.value = '';
  }

  onTitleInput(): void {
    if (this.form.value.id) return;

    const title = this.form.value.title || '';
    const generatedSlug = toSlug(title);
    if (!generatedSlug) return;

    const currentSlug = this.form.value.slug || '';
    if (
      !currentSlug ||
      currentSlug === this.autoSlugValue ||
      !this.slugManuallyEdited
    ) {
      this.form.patchValue({ slug: generatedSlug }, { emitEvent: false });
      this.autoSlugValue = generatedSlug;
      this.slugManuallyEdited = false;
    }
  }

  onSlugInput(): void {
    if (this.form.value.id) return;

    const currentSlug = toSlug(this.form.value.slug || '');
    this.slugManuallyEdited = Boolean(
      currentSlug && currentSlug !== this.autoSlugValue,
    );
  }

  private populateCategorySearch(categoryId: string): void {
    const category = this.categories.find((item) => item.id === categoryId);
    this.categorySearch = category ? category.name : '';
  }

  private populateBrandSearch(brandId: string): void {
    const brand = this.brands.find((item) => item.id === brandId);
    this.brandSearch = brand ? brand.name : '';
  }

  private buildProductFormData(): FormData {
    const value = this.form.getRawValue();
    const slug = value.slug?.trim() || toSlug(value.title || '');
    const formData = new FormData();
    formData.append('title', value.title || '');
    formData.append('slug', slug);
    formData.append('brandId', value.brandId || '');
    formData.append('brand', value.brand || '');
    formData.append('description', value.description || '');
    formData.append('image', value.image || '');
    formData.append('price', String(Number(value.price || 0)));
    formData.append(
      'salePrice',
      String(Number(value.salePrice || value.price || 0)),
    );
    formData.append('salePercent', String(Number(value.salePercent || 0)));
    formData.append('stock', String(Number(value.stock || 0)));
    formData.append('maxOrder', String(Number(value.maxOrder || 10)));
    formData.append('primaryCategoryId', value.primaryCategoryId || '');
    formData.append(
      'categoryIds',
      JSON.stringify([value.primaryCategoryId || '']),
    );
    formData.append('usedFor', value.usedFor || '');
    formData.append(
      'prescriptionRequired',
      String(Boolean(value.prescriptionRequired)),
    );
    formData.append('isActive', String(Boolean(value.isActive)));

    if (this.selectedImageFile) {
      formData.append('imageFile', this.selectedImageFile);
    }

    return formData;
  }

  private setImagePreview(url: string): void {
    this.revokeImageObjectUrl();
    this.imagePreviewUrl = url;
    if (url.startsWith('blob:')) {
      this.imageObjectUrl = url;
    }
  }

  private async compressImage(file: File): Promise<File> {
    if (!file.type.startsWith('image/')) return file;

    const bitmap = await createImageBitmap(file);
    const maxSize = 1600;
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    const targetWidth = Math.max(1, Math.round(bitmap.width * scale));
    const targetHeight = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const context = canvas.getContext('2d');
    if (!context) {
      bitmap.close?.();
      return file;
    }

    context.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
    bitmap.close?.();

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((result) => resolve(result), 'image/webp', 0.82);
    });

    if (!blob) return file;

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'image';
    const extension = blob.type === 'image/webp' ? 'webp' : 'jpg';
    return new File([blob], `${baseName}.${extension}`, { type: blob.type });
  }

  private revokeImageObjectUrl(): void {
    if (this.imageObjectUrl) {
      URL.revokeObjectURL(this.imageObjectUrl);
      this.imageObjectUrl = null;
    }
  }

  closeDeleteConfirm(): void {
    this.isDeleteConfirmOpen = false;
    this.pendingDeleteProductId = '';
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
          const id = this.pendingDeleteProductId;
          this.closeDeleteConfirm();
          if (!id) return;
          this.adminService.deleteProduct(id).subscribe(() => {
            this.load();
          });
        },
      },
    ];
  }
}
