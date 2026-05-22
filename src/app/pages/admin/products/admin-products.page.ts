import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent, IonItem, IonLabel, IonList, IonSearchbar } from '@ionic/angular/standalone';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../shared/models/app.models';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IonButton, IonContent, IonItem, IonLabel, IonList, IonSearchbar],
  template: `
    <ion-content>
      <div class="page-shell">
        <div class="section-title">
          <h2>Products</h2>
          <ion-button size="small" routerLink="/admin/products/new">Add Product</ion-button>
        </div>
        <ion-searchbar placeholder="Search products" [(ngModel)]="search" (ionInput)="load()"></ion-searchbar>
        <ion-list class="soft-card">
          <ion-item *ngFor="let product of products">
            <ion-label>
              <h2>{{ product.title }}</h2>
              <p>{{ product.brand }}</p>
              <p>Rs. {{ (product.salePrice ?? product.price) | number:'1.0-2' }} · Stock: {{ product.stock }} · {{ product.isActive ? 'Active' : 'Inactive' }}</p>
              <div>
                <ion-button size="small" fill="clear" [routerLink]="['/admin/products', product.id, 'edit']">Edit</ion-button>
                <ion-button size="small" fill="clear" color="danger">Delete</ion-button>
              </div>
            </ion-label>
          </ion-item>
        </ion-list>
      </div>
    </ion-content>
  `,
})
export class AdminProductsPage {
  private readonly productService = inject(ProductService);
  search = '';
  products: Product[] = [];

  constructor() {
    this.load();
  }

  load(): void {
    this.productService.getProducts({ search: this.search }).subscribe((products) => this.products = products);
  }
}
