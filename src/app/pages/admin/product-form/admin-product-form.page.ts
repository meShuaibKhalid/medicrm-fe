import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonButton, IonContent, IonInput, IonItem, IonLabel, IonSelect, IonSelectOption, IonTextarea, IonToggle } from '@ionic/angular/standalone';
import { AdminService } from '../../../core/services/admin.service';
import { CategoryService } from '../../../core/services/category.service';
import { ProductService } from '../../../core/services/product.service';
import { Category } from '../../../shared/models/app.models';

@Component({
  selector: 'app-admin-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonButton, IonContent, IonInput, IonItem, IonLabel, IonSelect, IonSelectOption, IonTextarea, IonToggle],
  template: `
    <ion-content>
      <div class="page-shell form-stack">
        <h2>{{ productId ? 'Edit Product' : 'Add Product' }}</h2>
        <form [formGroup]="form" class="form-stack">
          <ion-item class="soft-card"><ion-label position="stacked">Title</ion-label><ion-input formControlName="title"></ion-input></ion-item>
          <ion-item class="soft-card"><ion-label position="stacked">Slug</ion-label><ion-input formControlName="slug"></ion-input></ion-item>
          <ion-item class="soft-card"><ion-label position="stacked">Brand</ion-label><ion-input formControlName="brand"></ion-input></ion-item>
          <ion-item class="soft-card"><ion-label position="stacked">Description</ion-label><ion-textarea formControlName="description"></ion-textarea></ion-item>
          <ion-item class="soft-card"><ion-label position="stacked">Image URL</ion-label><ion-input formControlName="image"></ion-input></ion-item>
          <ion-item class="soft-card"><ion-label position="stacked">Price</ion-label><ion-input type="number" formControlName="price"></ion-input></ion-item>
          <ion-item class="soft-card"><ion-label position="stacked">Sale Price</ion-label><ion-input type="number" formControlName="salePrice"></ion-input></ion-item>
          <ion-item class="soft-card"><ion-label position="stacked">Sale Percent</ion-label><ion-input type="number" formControlName="salePercent"></ion-input></ion-item>
          <ion-item class="soft-card"><ion-label position="stacked">Stock</ion-label><ion-input type="number" formControlName="stock"></ion-input></ion-item>
          <ion-item class="soft-card"><ion-label position="stacked">Max Order</ion-label><ion-input type="number" formControlName="maxOrder"></ion-input></ion-item>
          <ion-item class="soft-card">
            <ion-label position="stacked">Category</ion-label>
            <ion-select formControlName="primaryCategoryId">
              <ion-select-option *ngFor="let category of categories" [value]="category.id">{{ category.name }}</ion-select-option>
            </ion-select>
          </ion-item>
          <ion-item class="soft-card"><ion-label position="stacked">Used For</ion-label><ion-input formControlName="usedFor"></ion-input></ion-item>
          <ion-item class="soft-card"><ion-label>Prescription Required</ion-label><ion-toggle formControlName="prescriptionRequired"></ion-toggle></ion-item>
          <ion-item class="soft-card"><ion-label>Active</ion-label><ion-toggle formControlName="isActive"></ion-toggle></ion-item>
          <ion-button expand="block" shape="round" (click)="save()">Save Product</ion-button>
        </form>
      </div>
    </ion-content>
  `,
})
export class AdminProductFormPage {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly categoryService = inject(CategoryService);
  private readonly productService = inject(ProductService);
  private readonly adminService = inject(AdminService);

  categories: Category[] = [];
  productId = this.route.snapshot.paramMap.get('id');
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
    maxOrder: [1],
    primaryCategoryId: ['', Validators.required],
    usedFor: [''],
    prescriptionRequired: [false],
    isActive: [true],
  });

  constructor() {
    this.categoryService.getCategories().subscribe((categories) => this.categories = categories.filter((category) => category.level === 0));
    if (this.productId) {
      this.productService.getProducts().subscribe((products) => {
        const product = products.find((item) => item.id === this.productId);
        if (product) {
          this.form.patchValue(product);
        }
      });
    }
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const payload = {
      ...value,
      id: value.id || `prd-${Date.now()}`,
      categoryIds: [value.primaryCategoryId || ''],
    };
    const request = this.productId ? this.adminService.updateProduct(payload as any) : this.adminService.createProduct(payload as any);
    request.subscribe(() => this.router.navigateByUrl('/admin/products'));
  }
}
