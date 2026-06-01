import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent, IonIcon, IonInput, IonItem, IonLabel, IonSearchbar, IonSelect, IonSelectOption, IonTextarea, IonToggle } from '@ionic/angular/standalone';
import { ProductService } from '../../../core/services/product.service';
import { AdminService } from '../../../core/services/admin.service';
import { CategoryService } from '../../../core/services/category.service';
import { Product, Category } from '../../../shared/models/app.models';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    RouterLink, 
    IonButton, 
    IonContent, 
    IonSearchbar, 
    IonInput, 
    IonItem, 
    IonLabel, 
    IonSelect, 
    IonSelectOption, 
    IonTextarea, 
    IonToggle,
    IonIcon
  ],
  template: `
<ion-content class="theme-bg">
  <div class="page-shell">
    
    <div class="section-header">
      <div class="title-row">
        <h2 class="main-title">Products</h2>
        <button class="btn-add" (click)="openAddModal()">
          ADD PRODUCT
        </button>
      </div>
      <ion-searchbar 
        class="theme-search" 
        placeholder="Search products..." 
        [(ngModel)]="search" 
        (ionInput)="page = 1; load()"
        mode="md">
      </ion-searchbar>
    </div>

    <span class="section-label">ALL PRODUCTS</span>

    <div class="list-panel-container">
      
      <div class="product-list-item" *ngFor="let product of products">
        
        <div class="product-info-block">
          <h3 class="product-name">{{ product.title }}</h3>
          <span class="product-brand">{{ product.brand | uppercase }}</span>
          
          <div class="meta-row">
            <span class="status-dot" [class.is-inactive]="!product.isActive"></span>
            <span class="price-text">Rs. {{ (product.salePrice ?? product.price) | number:'1.0-2' }}</span>
            <span class="divider">•</span>
            <span class="stock-text">Stock: {{ product.stock }}</span>
            <span class="divider">•</span>
            <span class="badge-tag" [class.active-tag]="product.isActive">
              {{ product.isActive ? 'Active' : 'Inactive' }}
            </span>
          </div>
        </div>

        <div class="product-actions-block">
          <button class="btn-action-edit" (click)="edit(product)">EDIT</button>
          <button class="btn-action-delete" (click)="deleteProduct(product.id)">DELETE</button>
        </div>

      </div>

      <div class="empty-state-row" *ngIf="products.length === 0">
        <p>No products found.</p>
      </div>

    </div>

    <div class="pagination-footer" *ngIf="totalPages > 1">
      <button class="page-nav" [disabled]="page === 1" (click)="goToPage(page - 1)">
        <ion-icon name="chevron-back-outline"></ion-icon> Previous
      </button>
      <span class="page-info">Page {{ page }} of {{ totalPages }}</span>
      <button class="page-nav" [disabled]="page === totalPages" (click)="goToPage(page + 1)">
        Next <ion-icon name="chevron-forward-outline"></ion-icon>
      </button>
    </div>

  <!-- Dialog Modal for Add/Edit Product -->
     <dialog #productDialog class="admin-modal matching-theme">
  <div class="modal-content-wrapper">
    
    <div class="modal-header">
      <h3 class="modal-heading">{{ form.value.id ? 'Edit Product' : 'Add Product' }}</h3>
      <button type="button" class="close-circle-btn" (click)="closeModal()">&times;</button>
    </div>

    <div class="modal-body-scroll">
      <form [formGroup]="form">
        
        <div class="modal-grid-2">
          <div class="form-field-group">
            <label class="form-field-label">NAME *</label>
            <div class="custom-input-box">
              <ion-input formControlName="title" placeholder="Product Title"></ion-input>
            </div>
          </div>
          <div class="form-field-group">
            <label class="form-field-label">SLUG *</label>
            <div class="custom-input-box">
              <ion-input formControlName="slug" placeholder="product-slug"></ion-input>
            </div>
          </div>
        </div>

        <div class="modal-grid-2">
          <div class="form-field-group">
            <label class="form-field-label">BRAND</label>
            <div class="custom-input-box">
              <ion-input formControlName="brand" placeholder="Brand Name"></ion-input>
            </div>
          </div>
          <div class="form-field-group">
            <label class="form-field-label">CATEGORY *</label>
            <div class="custom-input-box dynamic-select-box">
              <ion-select formControlName="primaryCategoryId" interface="popover" placeholder="Select">
                <ion-select-option *ngFor="let category of categories" [value]="category.id">
                  {{ category.name }}
                </ion-select-option>
              </ion-select>
            </div>
          </div>
        </div>

        <div class="modal-grid-2">
          <div class="form-field-group">
            <label class="form-field-label">PRICE *</label>
            <div class="custom-input-box">
              <ion-input type="number" formControlName="price" placeholder="Rs. 0.00"></ion-input>
            </div>
          </div>
          <div class="form-field-group">
            <label class="form-field-label">SALE PRICE</label>
            <div class="custom-input-box">
              <ion-input type="number" formControlName="salePrice" placeholder="Rs. 0.00"></ion-input>
            </div>
          </div>
        </div>

        <div class="modal-grid-2">
          <div class="form-field-group">
            <label class="form-field-label">SALE PERCENT</label>
            <div class="custom-input-box">
              <ion-input type="number" formControlName="salePercent" placeholder="0"></ion-input>
            </div>
          </div>
          <div class="form-field-group">
            <label class="form-field-label">STOCK</label>
            <div class="custom-input-box">
              <ion-input type="number" formControlName="stock" placeholder="0"></ion-input>
            </div>
          </div>
        </div>

        <div class="modal-grid-2">
          <div class="form-field-group">
            <label class="form-field-label">MAX ORDER</label>
            <div class="custom-input-box">
              <ion-input type="number" formControlName="maxOrder" placeholder="10"></ion-input>
            </div>
          </div>
          <div class="form-field-group">
            <label class="form-field-label">USED FOR</label>
            <div class="custom-input-box">
              <ion-input formControlName="usedFor" placeholder="Fever, pain, etc."></ion-input>
            </div>
          </div>
        </div>

        <div class="form-field-group full-width-field">
          <label class="form-field-label">IMAGE URL</label>
          <div class="custom-input-box">
            <ion-input formControlName="image" placeholder="https://example.com/image.jpg"></ion-input>
          </div>
        </div>

        <div class="form-field-group full-width-field">
          <label class="form-field-label">DESCRIPTION</label>
          <div class="custom-input-box text-area-box">
            <ion-textarea formControlName="description" rows="3" placeholder="Enter product description..."></ion-textarea>
          </div>
        </div>

        <div class="modal-grid-2 alignment-fix">
          <div class="form-field-group text-row-layout">
            <label class="form-field-label">PRESCRIPTION REQUIRED</label>
            <div class="custom-toggle-container">
              <span class="toggle-state-text">
                {{ form.get('prescriptionRequired')?.value ? 'Required' : 'None' }}
              </span>
              <ion-toggle formControlName="prescriptionRequired" class="emerald-toggle"></ion-toggle>
            </div>
          </div>
          
          <div class="form-field-group text-row-layout">
            <label class="form-field-label">STATUS</label>
            <div class="custom-toggle-container">
              <span class="toggle-state-text">
                {{ form.get('isActive')?.value ? 'Active' : 'Inactive' }}
              </span>
              <ion-toggle formControlName="isActive" class="emerald-toggle"></ion-toggle>
            </div>
          </div>
        </div>

        <div class="modal-action-footer">
          <button type="button" class="cancel-flat-btn" (click)="closeModal()">CANCEL</button>
          <button type="submit" class="save-theme-btn" [disabled]="form.invalid" (click)="save()">
            {{ form.value.id ? 'UPDATE CATEGORY' : 'SAVE CATEGORY' }}
          </button>
        </div>

      </form>
    </div>
    
  </div>
</dialog>
  </div>
</ion-content>
  `,
  styles: [`

.page-shell {
  padding: 20px 16px 32px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

// Section Header Layout Elements
.section-header {
  
  .title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .main-title {
 font-size: 20px;
    font-weight: 700;
    color: #000;
    margin: 0;
  }

  .btn-add {
    background: linear-gradient(
      135deg,
      #10b981,
      #059669); // Signature Emerald Green action trigger
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 700;
    font-size: 12px;
    letter-spacing: 0.03em;
    cursor: pointer;
  }
}

.theme-search {
  --background: #ffffff;
  --border-radius: 12px;
  --box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  padding: 0;
}

.section-label {
font-size: 12px;
    font-weight: 700;
    color: #0ea87d;
    letter-spacing: 0.7px;
    text-transform: uppercase;
    margin-block: 14px;
    padding-left: 6px;
    display: block;
}

// Main Panel Component styling matching stacked list layout image
.list-panel-container {
     display: flex;
    flex-direction: column;
    gap: 14px;

}

// Structured List Row Individual item matching your second design reference
.product-list-item {
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

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #fafcfb;
  }
}

// Info Meta Elements Block
.product-info-block {
  display: flex;
  flex-direction: column;

  .product-name {
    font-size: 15px;
    font-weight: 700;
    color: #2c1a22;
    margin-bottom: 2px;
    margin-top:0;
  }

  .product-brand {
    font-size: 11px;
    font-weight: 600;
    color: #9ca3af;
    letter-spacing: 0.03em;
    margin-bottom: 6px;
  }
}

// Inline parameters data row elements layout details
.meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #4b5563;

  .status-dot {
    width: 7px;
    height: 7px;
    background-color: #00a878; // Emerald active status point
    border-radius: 50%;
    display: inline-block;

    &.is-inactive {
      background-color: #f47174; // Inactive red status point
    }
  }

  .price-text {
    font-weight: 600;
  }

  .stock-text {
    color: #6b7280;
  }

  .divider {
    color: #d1d5db;
    font-size: 10px;
  }

  // Soft badge tag style indicators matching category setup setup
  .badge-tag {
    font-size: 10px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 6px;
    background: #fef2f2;
    color: #f47174;

    &.active-tag {
      background: #e6f6f1;
      color: #00a878;
    }
  }
}

// Action Button Styling items localized inside modern blocks
.product-actions-block {
      display: flex;
    flex-direction: column;
    gap: 7px;
    flex-shrink: 0;

  .btn-action-edit {
      padding: 8px;
    background: var(--ion-color-primary);
    color: #fff;
    font-size: 13px;
    font-weight: 600;
    border: none;
    border-radius: var(--app-border-radius-small, 8px);
    cursor: pointer;
    transition: background 0.18s;

    &:hover { background: #d0f0e5; }
  }

  .btn-action-delete {
    background: #fee2e2;
    color: #b91c1c;
    border: none;
    border-radius: 8px;
    padding: 6px 14px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;

    &:hover { background: #fee2e2; }
  }
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
    &:disabled { opacity: 0.5; cursor: not-allowed; }
  }

  .page-info { font-size: 13px; color: #6b7280; }
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
    .btn-action-edit, .btn-action-delete {
      flex: 1;
      text-align: center;
    }
  }
}

// Modal Shell Configuration matching exact dimensions and border radii
dialog.admin-modal.matching-theme {
  border: none;
  border-radius: 28px; // Matching image rounding scale
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

// Modal Header
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
  padding-bottom: 4px;

  .modal-heading {
    font-size: 20px;
    font-weight: 700;
    color: #111827;
    margin: 0;
  }

  // Exact green action circle from user screenshots
  .close-circle-btn {
    background: #00a878;
    color: #ffffff;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: none;
    font-size: 18px;
    font-weight: 400;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: #009368;
    }
  }
}

// Content scroll restrictions to protect modal aspect ratios
.modal-body-scroll {
  max-height: 72vh;
  overflow-y: auto;
  padding: 24px;

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
    color: #00a878; // Custom Emerald Label Color
  }

  // Exact input design border box setup
  .custom-input-box {
    background: #ffffff;
    border: 1px solid #f2f4f6;
    border-radius: 12px; // Generous rounding framework
    padding: 2px 14px;
    transition: border-color 0.2s, box-shadow 0.2s;

    &:focus-within {
      border-color: #00a878;
    }

    ion-input {
      --padding-top: 10px;
      --padding-bottom: 10px;
      --padding-start: 0px;
      --padding-end: 0px;
      font-size: 14px;
      font-weight: 500;
      color: #1f2937;
    }

    ion-textarea {
      --padding-top: 10px;
      --padding-bottom: 10px;
      --padding-start: 0px;
      --padding-end: 0px;
      font-size: 14px;
      font-weight: 500;
      color: #1f2937;
    }
  }

  // Dropdown Component variant alignments
  .dynamic-select-box {
    padding: 3px 14px;

    ion-select {
      --padding-start: 0px;
      --padding-end: 0px;
      font-size: 14px;
      font-weight: 500;
      color: #1f2937;
      width: 100%;
    }
  }
}

// Custom Toggle Input row integration styles
.custom-toggle-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border: 1px solid #f2f4f6;
  border-radius: 12px;
  padding: 10px 16px;
  height: 44px;

  .toggle-state-text {
    font-size: 14px;
    color: #1f2937;
    font-weight: 500;
  }
}

// Core platform custom emerald toggles overrides
ion-toggle.emerald-toggle {
  --handle-background-checked: #ffffff;
  --background-checked: #00a878;
  --handle-spacing: 3px;
}

// Bottom Button Deck configuration details matching exact specifications
.modal-action-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
  padding-top: 8px;

  .cancel-flat-btn {
    background: transparent;
    border: none;
    color: #9ca3af;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.05em;
    cursor: pointer;
    padding: 12px 18px;
    transition: color 0.2s;

    &:hover {
      color: #6b7280;
    }
  }

  .save-theme-btn {
    background: #00a878;
    color: #ffffff;
    border: none;
    border-radius: 50px; // Capsule pill shape button design
    padding: 12px 28px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.05em;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(0, 168, 120, 0.15);
    transition: background-color 0.2s, opacity 0.2s;

    &:hover {
      background-color: #009368;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      box-shadow: none;
    }
  }
}

// Mobile responsive adaptation stack rules
@media (max-width: 640px) {
  .modal-content-wrapper {
    padding: 24px 20px;
  }

  .modal-grid-2 {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 16px;
  }
  
  .modal-action-footer {
    flex-direction: column-reverse;
    gap: 10px;
    
    .save-theme-btn, .cancel-flat-btn {
      width: 100%;
      text-align: center;
    }
  }
}
  `]
})
export class AdminProductsPage {
  private readonly productService = inject(ProductService);
  private readonly adminService = inject(AdminService);
  private readonly categoryService = inject(CategoryService);
  private readonly fb = inject(FormBuilder);

  search = '';
  products: Product[] = [];
  categories: Category[] = [];

  page = 1;
  limit = 10;
  totalItems = 0;
  totalPages = 1;

  form = this.fb.group({
    id: [''],
    title: ['', Validators.required],
    slug: ['', Validators.required],
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
      this.categories = categories.filter((category) => category.level === 0 || !category.parentId);
    });
  }

  load(): void {
    this.adminService.getAdminProducts({ search: this.search, page: this.page, limit: this.limit }).subscribe((res) => {
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
    this.productDialog.nativeElement.showModal();
  }

  edit(product: Product): void {
    this.form.patchValue({
      id: product.id,
      title: product.title,
      slug: product.slug,
      brand: product.brand,
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
    this.productDialog.nativeElement.showModal();
  }

  closeModal(): void {
    this.productDialog.nativeElement.close();
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const payload: Product = {
      id: value.id || `prd-${Date.now()}`,
      title: value.title || '',
      slug: value.slug || '',
      brand: value.brand || '',
      description: value.description || '',
      image: value.image || '',
      price: Number(value.price || 0),
      salePrice: Number(value.salePrice || value.price || 0),
      salePercent: Number(value.salePercent || 0),
      stock: Number(value.stock || 0),
      maxOrder: Number(value.maxOrder || 10),
      primaryCategoryId: value.primaryCategoryId || '',
      categoryIds: [value.primaryCategoryId || ''],
      usedFor: value.usedFor || '',
      prescriptionRequired: Boolean(value.prescriptionRequired),
      isActive: Boolean(value.isActive),
    };

    const request = value.id ? this.adminService.updateProduct(payload) : this.adminService.createProduct(payload);
    request.subscribe(() => {
      this.load();
      this.closeModal();
      this.resetForm();
    });
  }

  deleteProduct(id: string): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.adminService.deleteProduct(id).subscribe(() => {
        this.load();
      });
    }
  }

  resetForm(): void {
    this.form.reset({
      id: '',
      title: '',
      slug: '',
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
  }
}
