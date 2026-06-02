import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, inject, ViewChild } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonAlert } from '@ionic/angular/standalone';
import { IonButton, IonContent, IonInput, IonItem, IonLabel, IonSearchbar, IonSelect, IonSelectOption, IonTextarea, IonToggle } from '@ionic/angular/standalone';
import { AdminService } from '../../../core/services/admin.service';
import { CategoryService } from '../../../core/services/category.service';
import { Brand, Product, Category } from '../../../shared/models/app.models';
import { BrandService } from '../../../core/services/brand.service';
import { toSlug } from '../../../shared/utils/slug';

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
    IonSelect,
    IonSelectOption,
    IonTextarea, 
    IonToggle,
  ],
  template: `
    <ion-content>
      <div class="page-shell">
        <div class="section-title">
          <h2>Products</h2>
          <ion-button size="small" (click)="openAddModal()">Add Product</ion-button>
        </div>
        <ion-searchbar placeholder="Search products" [(ngModel)]="search" (ionInput)="onSearchInput()"></ion-searchbar>
        
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
                <td><strong>{{ product.title }}</strong></td>
                <td>{{ product.brand }}</td>
                <td>Rs. {{ (product.salePrice ?? product.price) | number:'1.0-2' }}</td>
                <td>{{ product.stock }}</td>
                <td>
                  <span [class]="product.isActive ? 'text-success' : 'text-danger'">
                    {{ product.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="actions-cell">
                  <ion-button size="small" fill="outline" (click)="edit(product)">
                    Edit
                  </ion-button>
                  <ion-button size="small" fill="solid" color="danger" (click)="deleteProduct(product.id)">
                    Delete
                  </ion-button>
                </td>
              </tr>
              <tr *ngIf="products.length === 0">
                <td colspan="6" style="text-align: center; color: #68818d;">No products found.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination-controls" *ngIf="totalPages > 1">
          <ion-button size="small" fill="outline" [disabled]="page === 1" (click)="goToPage(page - 1)">Previous</ion-button>
          <span>Page {{ page }} of {{ totalPages }} (Total: {{ totalItems }})</span>
          <ion-button size="small" fill="outline" [disabled]="page === totalPages" (click)="goToPage(page + 1)">Next</ion-button>
        </div>

        <!-- Dialog Modal for Add/Edit Product -->
        <dialog #productDialog class="admin-modal" style="max-width: 800px;">
          <div class="modal-header">
            <h3>{{ form.value.id ? 'Edit Product' : 'Add Product' }}</h3>
            <button (click)="closeModal()">&times;</button>
          </div>
          <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
            <form [formGroup]="form" class="form-stack">
              <div class="modal-grid-2">
                <ion-item class="soft-card">
                  <ion-label position="stacked">Title *</ion-label>
                  <ion-input formControlName="title" placeholder="Product Title" (ionInput)="onTitleInput()"></ion-input>
                </ion-item>
                <ion-item class="soft-card">
                  <ion-label position="stacked">Slug *</ion-label>
                  <ion-input formControlName="slug" placeholder="product-slug" (ionInput)="onSlugInput()"></ion-input>
                </ion-item>
              </div>

              <div class="modal-grid-2">
                <ion-item class="soft-card">
                  <ion-label position="stacked">Brand</ion-label>
                  <ion-select formControlName="brandId" interface="popover" placeholder="Select brand">
                    <ion-select-option value="">No Brand</ion-select-option>
                    <ion-select-option *ngFor="let brand of brands" [value]="brand.id">{{ brand.name }}</ion-select-option>
                  </ion-select>
                </ion-item>
                <div class="category-picker soft-card">
                  <label class="field-label">Category *</label>
                  <div class="category-dropdown">
                    <input
                      type="text"
                      [(ngModel)]="categorySearch"
                      [ngModelOptions]="{ standalone: true }"
                      placeholder="Search categories"
                      class="category-search-input"
                      (focus)="openCategoryDropdown()"
                      (input)="openCategoryDropdown()"
                    />
                    <button
                      type="button"
                      class="category-toggle-btn"
                      (click)="toggleCategoryDropdown()"
                      aria-label="Toggle category dropdown"
                    >
                      {{ isCategoryDropdownOpen ? '▲' : '▼' }}
                    </button>
                  </div>
                  <div class="category-results" *ngIf="isCategoryDropdownOpen">
                    <button
                      *ngFor="let category of filteredCategories"
                      type="button"
                      class="category-option"
                      [class.selected]="form.value.primaryCategoryId === category.id"
                      (click)="selectCategory(category)"
                    >
                      {{ category.name }}
                    </button>
                    <p class="category-empty" *ngIf="filteredCategories.length === 0">No categories found.</p>
                  </div>
                  <p class="selected-category" *ngIf="selectedCategoryLabel">Selected: {{ selectedCategoryLabel }}</p>
                </div>
              </div>

              <div class="modal-grid-2">
                <ion-item class="soft-card">
                  <ion-label position="stacked">Price *</ion-label>
                  <ion-input type="number" formControlName="price" placeholder="Rs. 0.00"></ion-input>
                </ion-item>
                <ion-item class="soft-card">
                  <ion-label position="stacked">Sale Price</ion-label>
                  <ion-input type="number" formControlName="salePrice" placeholder="Rs. 0.00"></ion-input>
                </ion-item>
              </div>

              <div class="modal-grid-2">
                <ion-item class="soft-card">
                  <ion-label position="stacked">Sale Percent</ion-label>
                  <ion-input type="number" formControlName="salePercent" placeholder="0"></ion-input>
                </ion-item>
                <ion-item class="soft-card">
                  <ion-label position="stacked">Stock</ion-label>
                  <ion-input type="number" formControlName="stock" placeholder="0"></ion-input>
                </ion-item>
              </div>

              <div class="modal-grid-2">
                <ion-item class="soft-card">
                  <ion-label position="stacked">Max Order</ion-label>
                  <ion-input type="number" formControlName="maxOrder" placeholder="10"></ion-input>
                </ion-item>
                <ion-item class="soft-card">
                  <ion-label position="stacked">Used For</ion-label>
                  <ion-input formControlName="usedFor" placeholder="Fever, pain, etc."></ion-input>
                </ion-item>
              </div>

              <div class="soft-card image-upload-card">
                <label class="field-label">Product Image</label>
                <input type="file" accept="image/*" (change)="onImageSelected($event)" />
                <p class="selected-file" *ngIf="selectedImageName">{{ selectedImageName }}</p>
                <div class="image-preview" *ngIf="imagePreviewUrl">
                  <img [src]="imagePreviewUrl" [alt]="form.value.title || 'Product image preview'" />
                </div>
              </div>

              <ion-item class="soft-card">
                <ion-label position="stacked">Description</ion-label>
                <ion-textarea formControlName="description" rows="3" placeholder="Enter product description..."></ion-textarea>
              </ion-item>

              <div class="modal-grid-2">
                <ion-item class="soft-card" style="align-items: center; display: flex; height: 100%;">
                  <ion-label>Prescription Required</ion-label>
                  <ion-toggle formControlName="prescriptionRequired"></ion-toggle>
                </ion-item>
                <ion-item class="soft-card" style="align-items: center; display: flex; height: 100%;">
                  <ion-label>Active</ion-label>
                  <ion-toggle formControlName="isActive"></ion-toggle>
                </ion-item>
              </div>

              <div style="margin-top: 16px; display: flex; gap: 12px; justify-content: flex-end;">
                <ion-button fill="outline" color="medium" (click)="closeModal()">Cancel</ion-button>
                <ion-button [disabled]="form.invalid" (click)="save()">
                  {{ form.value.id ? 'Update Product' : 'Save Product' }}
                </ion-button>
              </div>
            </form>
          </div>
        </dialog>

        <ion-alert
          [isOpen]="isDeleteConfirmOpen"
          header="Delete Product"
          message="Are you sure you want to delete this product?"
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
      z-index: 20;
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

    .image-upload-card input[type="file"] {
      display: block;
      width: 100%;
      padding: 10px 0;
    }

    .image-preview {
      margin-top: 12px;
    }

    .image-preview img {
      width: 160px;
      height: 160px;
      object-fit: contain;
      border-radius: 16px;
      background: #f6f8fa;
      border: 1px solid #d8e4ea;
      padding: 10px;
    }
  `],
})
export class AdminProductsPage implements OnDestroy {
  private readonly adminService = inject(AdminService);
  private readonly categoryService = inject(CategoryService);
  private readonly brandService = inject(BrandService);
  private readonly fb = inject(FormBuilder);
  private searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  search = '';
  products: Product[] = [];
  categories: Category[] = [];
  brands: Brand[] = [];
  categorySearch = '';
  isCategoryDropdownOpen = false;
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
      this.categories = categories
        .sort((a, b) => a.name.localeCompare(b.name));
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
    return this.categories.filter((category) => category.name.toLowerCase().includes(term));
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
    const dialog = this.productDialog?.nativeElement;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
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
    const dialog = this.productDialog?.nativeElement;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
  }

  closeModal(): void {
    this.isCategoryDropdownOpen = false;
    const dialog = this.productDialog?.nativeElement;
    if (dialog?.open) {
      dialog.close();
    }
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
    this.isCategoryDropdownOpen = false;
    this.setImagePreview('');
  }

  selectCategory(category: Category): void {
    this.form.patchValue({ primaryCategoryId: category.id });
    this.categorySearch = category.name;
    this.isCategoryDropdownOpen = false;
  }

  openCategoryDropdown(): void {
    this.isCategoryDropdownOpen = true;
  }

  toggleCategoryDropdown(): void {
    this.isCategoryDropdownOpen = !this.isCategoryDropdownOpen;
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedImageFile = file;
    this.selectedImageName = file?.name || '';
    this.setImagePreview(file ? URL.createObjectURL(file) : this.form.value.image || '');
    input.value = '';
  }

  onTitleInput(): void {
    if (this.form.value.id) return;

    const title = this.form.value.title || '';
    const generatedSlug = toSlug(title);
    if (!generatedSlug) return;

    const currentSlug = this.form.value.slug || '';
    if (!currentSlug || currentSlug === this.autoSlugValue || !this.slugManuallyEdited) {
      this.form.patchValue({ slug: generatedSlug }, { emitEvent: false });
      this.autoSlugValue = generatedSlug;
      this.slugManuallyEdited = false;
    }
  }

  onSlugInput(): void {
    if (this.form.value.id) return;

    const currentSlug = toSlug(this.form.value.slug || '');
    this.slugManuallyEdited = Boolean(currentSlug && currentSlug !== this.autoSlugValue);
  }

  private populateCategorySearch(categoryId: string): void {
    const category = this.categories.find((item) => item.id === categoryId);
    this.categorySearch = category ? category.name : '';
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
    formData.append('salePrice', String(Number(value.salePrice || value.price || 0)));
    formData.append('salePercent', String(Number(value.salePercent || 0)));
    formData.append('stock', String(Number(value.stock || 0)));
    formData.append('maxOrder', String(Number(value.maxOrder || 10)));
    formData.append('primaryCategoryId', value.primaryCategoryId || '');
    formData.append('categoryIds', JSON.stringify([value.primaryCategoryId || '']));
    formData.append('usedFor', value.usedFor || '');
    formData.append('prescriptionRequired', String(Boolean(value.prescriptionRequired)));
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
