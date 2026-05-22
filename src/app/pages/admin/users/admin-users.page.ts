import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonButton, IonContent, IonItem, IonLabel, IonList, IonSearchbar } from '@ionic/angular/standalone';
import { AdminService } from '../../../core/services/admin.service';
import { User } from '../../../shared/models/app.models';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, IonButton, IonContent, IonItem, IonLabel, IonList, IonSearchbar],
  template: `
    <ion-content>
      <div class="page-shell">
        <div class="section-title"><h2>Users</h2></div>
        <ion-searchbar placeholder="Search users" [(ngModel)]="search"></ion-searchbar>
        <ion-list class="soft-card">
          <ion-item *ngFor="let user of filteredUsers">
            <ion-label>
              <h2>{{ user.name }}</h2>
              <p>{{ user.email }} · {{ user.phone }}</p>
              <p>{{ user.isActive ? 'Active' : 'Inactive' }}</p>
              <ion-button size="small" fill="clear" (click)="toggle(user)">{{ user.isActive ? 'Deactivate' : 'Activate' }}</ion-button>
            </ion-label>
          </ion-item>
        </ion-list>
      </div>
    </ion-content>
  `,
})
export class AdminUsersPage {
  private readonly adminService = inject(AdminService);
  users: User[] = [];
  search = '';

  constructor() {
    this.adminService.getUsers().subscribe((users) => this.users = users.filter((user) => user.role === 'customer'));
  }

  get filteredUsers(): User[] {
    const term = this.search.toLowerCase();
    return this.users.filter((user) => user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term) || user.phone.includes(term));
  }

  toggle(user: User): void {
    this.adminService.updateUserStatus(user.id, !user.isActive).subscribe(() => {
      user.isActive = !user.isActive;
    });
  }
}
