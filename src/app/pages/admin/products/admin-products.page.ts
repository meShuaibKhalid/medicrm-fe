import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent, IonInput, IonItem, IonLabel, IonSearchbar, IonSelect, IonSelectOption, IonTextarea, IonToggle } from '@ionic/angular/standalone';
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
    IonToggle
  ],
  template: `
    <ion-content>
      <div class="page-shell">
        <div class="section-title">
          <h2>Products</h2>
          <ion-button size="small" (click)="openAddModal()">Add Product</ion-button>
        </div>
        <ion-searchbar placeholder="Search products" [(ngModel)]="search" (ionInput)="page = 1; load()"></ion-searchbar>
        
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
                  <ion-input formControlName="title" placeholder="Product Title"></ion-input>
                </ion-item>
                <ion-item class="soft-card">
                  <ion-label position="stacked">Slug *</ion-label>
                  <ion-input formControlName="slug" placeholder="product-slug"></ion-input>
                </ion-item>
              </div>

              <div class="modal-grid-2">
                <ion-item class="soft-card">
                  <ion-label position="stacked">Brand</ion-label>
                  <ion-input formControlName="brand" placeholder="Brand Name"></ion-input>
                </ion-item>
                <ion-item class="soft-card">
                  <ion-label position="stacked">Category *</ion-label>
                  <ion-select formControlName="primaryCategoryId">
                    <ion-select-option *ngFor="let category of categories" [value]="category.id">{{ category.name }}</ion-select-option>
                  </ion-select>
                </ion-item>
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

              <ion-item class="soft-card">
                <ion-label position="stacked">Image URL</ion-label>
                <ion-input formControlName="image" placeholder="https://example.com/image.jpg"></ion-input>
              </ion-item>

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
      </div>
    </ion-content>
  `,
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
