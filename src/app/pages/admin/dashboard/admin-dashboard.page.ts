import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { IonCard, IonCardContent, IonContent } from '@ionic/angular/standalone';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, IonCard, IonCardContent, IonContent],
  template: `
    <ion-content>
      <div class="page-shell">
        <div class="section-title"><h2>Dashboard</h2></div>
        <div class="stat-grid">
          <ion-card class="soft-card" *ngFor="let stat of stats">
            <ion-card-content>
              <p>{{ stat.label }}</p>
              <h2>{{ stat.value }}</h2>
            </ion-card-content>
          </ion-card>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`p { margin:0 0 8px; color:#68818d; } h2 { margin:0; color:#173d52; }`],
})
export class AdminDashboardPage {
  private readonly adminService = inject(AdminService);
  stats: { label: string; value: number }[] = [];

  constructor() {
    this.adminService.getDashboardStats().subscribe((stats) => this.stats = stats);
  }
}
