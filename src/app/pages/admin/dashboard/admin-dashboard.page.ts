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
        <div class="section-header">
          <h2 class="main-title">Dashboard</h2>
        </div>

        <span class="section-label">OVERVIEW</span>

        <div class="stat-grid">
          <ion-card class="theme-card" *ngFor="let stat of stats">
            <ion-card-content class="card-body">
              <p class="stat-label">{{ stat.label }}</p>
              <h2 class="stat-value">{{ stat.value }}</h2>
            </ion-card-content>
          </ion-card>
        </div>
      </div>
    </ion-content>
  `,
  styles: [
    `
      .page-shell {
        padding: 24px;
        font-family:
          -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica,
          Arial, sans-serif;
      }

      // Section Title
      .section-header {
        margin-bottom: 20px;

        .main-title {
          font-size: 28px;
          font-weight: 700;
          color: #111827; // Dark charcoal
          margin: 0;
        }
      }

      // Section sub-label matching "ALL CATEGORIES"
      .section-label {
        font-size: 12px;
        font-weight: 700;
        color: #0ea87d;
        letter-spacing: 0.7px;
        text-transform: uppercase;
        padding-left: 6px;
        margin-bottom: 14px;
        display: block;
      }

      // Grid Layout
      .stat-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 16px;
      }

      // Theme Styled Cards
      ion-card.theme-card {
        margin: 0;
        background: #ffffff;
        border-radius: 18px; // Smooth, generous rounding from your layout
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03); // Ultra soft shadow
        border: 1px solid rgba(0, 0, 0, 0.01);
        overflow: hidden;

        .card-body {
          padding: 20px;
        }

        // Muted monospaced/clean label style
        .stat-label {
          font-size: 14px;
          font-weight: 500;
          color: #6b7280; // Muted grey
          margin: 0 0 8px 0;
        }

        // Crisp, prominent value header
        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #00a878; // Your primary Emerald Green accent color
          margin: 0;
        }
      }
    `,
  ],
})
export class AdminDashboardPage {
  private readonly adminService = inject(AdminService);
  stats: { label: string; value: number }[] = [];

  constructor() {
    this.adminService
      .getDashboardStats()
      .subscribe((stats) => (this.stats = stats));
  }
}
