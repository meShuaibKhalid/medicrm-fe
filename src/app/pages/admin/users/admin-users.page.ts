import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonButton, IonContent, IonSearchbar } from '@ionic/angular/standalone';
import { AdminService } from '../../../core/services/admin.service';
import { User } from '../../../shared/models/app.models';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, IonButton, IonContent, IonSearchbar],
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
      </div>
    </ion-content>
  `,
})
export class AdminUsersPage {
  private readonly adminService = inject(AdminService);
  users: User[] = [];
  search = '';
  page = 1;
  limit = 10;
  totalItems = 0;
  totalPages = 1;

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
    if (confirm('Are you sure you want to delete this user?')) {
      this.adminService.deleteUser(id).subscribe(() => {
        this.load();
      });
    }
  }
}
