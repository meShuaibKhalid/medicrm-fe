import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonAlert, IonButton, IonContent, IonSearchbar } from '@ionic/angular/standalone';
import { AdminService } from '../../../core/services/admin.service';
import { User } from '../../../shared/models/app.models';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, IonAlert, IonButton, IonContent, IonSearchbar],
  template: `
    <ion-content>
      <div class="page-shell">
        <div class="section-title"><h2>Users</h2></div>
        <ion-searchbar placeholder="Search users" [(ngModel)]="search" (ionInput)="page = 1; load()"></ion-searchbar>
        
        <div class="admin-table-wrapper">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of users">
                <td><strong>{{ user.name }}</strong></td>
                <td>{{ user.email }}</td>
                <td>{{ user.phone }}</td>
                <td>
                  <span [class]="user.isActive ? 'text-success' : 'text-danger'">
                    {{ user.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="actions-cell">
                  <ion-button 
                    size="small" 
                    fill="solid" 
                    color="danger"
                    (click)="deleteUser(user.id)">
                    Delete
                  </ion-button>
                </td>
              </tr>
              <tr *ngIf="users.length === 0">
                <td colspan="5" style="text-align: center; color: #68818d;">No users found.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination-controls" *ngIf="totalPages > 1">
          <ion-button size="small" fill="outline" [disabled]="page === 1" (click)="goToPage(page - 1)">Previous</ion-button>
          <span>Page {{ page }} of {{ totalPages }} (Total: {{ totalItems }})</span>
          <ion-button size="small" fill="outline" [disabled]="page === totalPages" (click)="goToPage(page + 1)">Next</ion-button>
        </div>

        <ion-alert
          [isOpen]="isDeleteConfirmOpen"
          header="Delete User"
          message="Are you sure you want to delete this user?"
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
  `],
})
export class AdminUsersPage {
  private readonly adminService = inject(AdminService);
  users: User[] = [];
  search = '';
  page = 1;
  limit = 10;
  totalItems = 0;
  totalPages = 1;
  isDeleteConfirmOpen = false;
  private pendingDeleteUserId = '';

  constructor() {}

  ionViewWillEnter() {
    this.load();
  }

  load(): void {
    this.adminService.getUsers({ search: this.search, page: this.page, limit: this.limit }).subscribe((res) => {
      this.users = res.items.filter((user) => user.role === 'user');
      this.totalItems = res.pagination.total;
      this.totalPages = res.pagination.totalPages;
    });
  }

  goToPage(p: number): void {
    this.page = p;
    this.load();
  }

  deleteUser(id: string): void {
    this.pendingDeleteUserId = id;
    this.isDeleteConfirmOpen = true;
  }

  closeDeleteConfirm(): void {
    this.isDeleteConfirmOpen = false;
    this.pendingDeleteUserId = '';
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
          const id = this.pendingDeleteUserId;
          this.closeDeleteConfirm();
          if (!id) return;
          this.adminService.deleteUser(id).subscribe(() => {
            this.load();
          });
        },
      },
    ];
  }
}
