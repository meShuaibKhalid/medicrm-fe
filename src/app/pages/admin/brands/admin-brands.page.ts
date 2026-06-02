import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonButton, IonContent, IonInput, IonItem, IonLabel, IonSearchbar, IonToggle } from '@ionic/angular/standalone';
import { AdminService } from '../../../core/services/admin.service';
import { Brand } from '../../../shared/models/app.models';
import { toSlug } from '../../../shared/utils/slug';

@Component({
  selector: 'app-admin-brands',
  standalone: true,
  imports: [CommonModule, FormsModule, IonButton, IonContent, IonInput, IonItem, IonLabel, IonSearchbar, IonToggle],
  template: `
    <ion-content>
      <div class="page-shell">
        <div class="section-title">
          <h2>Brands</h2>
          <ion-button size="small" (click)="openAddModal()">Add Brand</ion-button>
        </div>
        <ion-searchbar placeholder="Search brands" [(ngModel)]="search" (ionInput)="onSearchInput()"></ion-searchbar>

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
              <tr *ngFor="let brand of brands">
                <td><strong>{{ brand.name }}</strong></td>
                <td>{{ brand.slug }}</td>
                <td>
                  <span [class]="brand.isActive ? 'text-success' : 'text-danger'">
                    {{ brand.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="actions-cell">
                  <ion-button size="small" fill="outline" (click)="edit(brand)">Edit</ion-button>
                  <ion-button size="small" fill="solid" color="danger" (click)="deleteBrand(brand.id)">Delete</ion-button>
                </td>
              </tr>
              <tr *ngIf="brands.length === 0">
                <td colspan="4" style="text-align: center; color: #68818d;">No brands found.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination-controls" *ngIf="totalPages > 1">
          <ion-button size="small" fill="outline" [disabled]="page === 1" (click)="goToPage(page - 1)">Previous</ion-button>
          <span>Page {{ page }} of {{ totalPages }} (Total: {{ totalItems }})</span>
          <ion-button size="small" fill="outline" [disabled]="page === totalPages" (click)="goToPage(page + 1)">Next</ion-button>
        </div>

        <dialog #brandDialog class="admin-modal" style="max-width: 650px;">
          <div class="modal-header">
            <h3>{{ form.id ? 'Edit Brand' : 'Add Brand' }}</h3>
            <button (click)="closeModal()">&times;</button>
          </div>
          <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
            <form class="form-stack">
              <ion-item class="soft-card">
                <ion-label position="stacked">Name *</ion-label>
                <ion-input [(ngModel)]="form.name" [ngModelOptions]="{ standalone: true }" placeholder="Brand name" (ionInput)="onNameInput()"></ion-input>
              </ion-item>
              <ion-item class="soft-card">
                <ion-label position="stacked">Slug *</ion-label>
                <ion-input [(ngModel)]="form.slug" [ngModelOptions]="{ standalone: true }" placeholder="brand-slug" (ionInput)="onSlugInput()"></ion-input>
              </ion-item>
              <ion-item class="soft-card" style="align-items: center; display: flex; height: 100%;">
                <ion-label>Status</ion-label>
                <ion-toggle [(ngModel)]="form.isActive" [ngModelOptions]="{ standalone: true }"></ion-toggle>
              </ion-item>
              <div style="margin-top: 16px; display: flex; gap: 12px; justify-content: flex-end;">
                <ion-button fill="outline" color="medium" (click)="closeModal()">Cancel</ion-button>
                <ion-button [disabled]="!form.name" (click)="save()">
                  {{ form.id ? 'Update Brand' : 'Save Brand' }}
                </ion-button>
              </div>
            </form>
          </div>
        </dialog>
      </div>
    </ion-content>
  `,
})
export class AdminBrandsPage implements OnDestroy {
  private readonly adminService = inject(AdminService);
  private searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  search = '';
  brands: Brand[] = [];
  page = 1;
  limit = 10;
  totalItems = 0;
  totalPages = 1;
  private autoSlugValue = '';
  private slugManuallyEdited = false;
  form: Partial<Brand> = {
    id: '',
    name: '',
    slug: '',
    isActive: true,
  };

  @ViewChild('brandDialog') brandDialog!: ElementRef<HTMLDialogElement>;

  constructor() {
    this.load();
  }

  ngOnDestroy(): void {
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
      this.searchDebounceTimer = null;
    }
  }

  onSearchInput(): void {
    this.page = 1;
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
    this.searchDebounceTimer = setTimeout(() => this.load(), 250);
  }

  load(): void {
    this.adminService.getAdminBrands({ search: this.search, page: this.page, limit: this.limit }).subscribe((res) => {
      this.brands = res.items;
      this.totalItems = res.pagination.total;
      this.totalPages = res.pagination.totalPages;
    });
  }

  goToPage(page: number): void {
    this.page = page;
    this.load();
  }

  openAddModal(): void {
    this.resetForm();
    const dialog = this.brandDialog?.nativeElement;
    if (dialog && !dialog.open) dialog.showModal();
  }

  edit(brand: Brand): void {
    this.form = {
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      isActive: brand.isActive,
    };
    this.autoSlugValue = brand.slug;
    this.slugManuallyEdited = false;
    const dialog = this.brandDialog?.nativeElement;
    if (dialog && !dialog.open) dialog.showModal();
  }

  closeModal(): void {
    const dialog = this.brandDialog?.nativeElement;
    if (dialog?.open) dialog.close();
  }

  onNameInput(): void {
    const name = this.form.name || '';
    const generatedSlug = toSlug(name);
    if (!generatedSlug) return;

    const currentSlug = this.form.slug || '';
    if (!currentSlug || currentSlug === this.autoSlugValue || !this.slugManuallyEdited) {
      this.form.slug = generatedSlug;
      this.autoSlugValue = generatedSlug;
      this.slugManuallyEdited = false;
    }
  }

  onSlugInput(): void {
    const currentSlug = toSlug(this.form.slug || '');
    this.slugManuallyEdited = Boolean(currentSlug && currentSlug !== this.autoSlugValue);
  }

  save(): void {
    if (!this.form.name) return;

    const payload: Brand = {
      id: this.form.id || '',
      name: this.form.name.trim(),
      slug: (this.form.slug || toSlug(this.form.name || '')).trim(),
      isActive: Boolean(this.form.isActive),
    };

    const request = payload.id
      ? this.adminService.updateBrand(payload)
      : this.adminService.createBrand(payload);

    request.subscribe(() => {
      this.load();
      this.closeModal();
      this.resetForm();
    });
  }

  deleteBrand(id: string): void {
    this.adminService.deleteBrand(id).subscribe(() => this.load());
  }

  private resetForm(): void {
    this.form = {
      id: '',
      name: '',
      slug: '',
      isActive: true,
    };
    this.autoSlugValue = '';
    this.slugManuallyEdited = false;
  }
}
