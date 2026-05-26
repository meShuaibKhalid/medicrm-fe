import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IonBadge } from '@ionic/angular/standalone';

@Component({
  selector: 'app-price-display',
  standalone: true,
  imports: [CommonModule, IonBadge],
  template: `
    <div class="price-wrap">
      <div class="prices">
        <strong>Rs. {{ (salePrice ?? price) | number:'1.0-2' }}</strong>
        <span *ngIf="salePrice && salePrice < price" class="price-old">Rs. {{ price | number:'1.0-2' }}</span>
      </div>
      <ion-badge *ngIf="salePercent" color="danger">{{ salePercent }}% OFF</ion-badge>
    </div>
  `,
  styles: [`
    .price-wrap { display:flex; align-items:center; justify-content:space-between; gap:8px; }
    .prices { display:flex; flex-direction:column; gap:2px; }
    strong { 
          display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-transform: capitalize; 
            color: var(--ion-color-primary);
    font-weight: 700;
    font-size: .9rem;
    transform: translateY(2px);
    }
    span { font-size:.82rem; }
  `],
})
export class PriceDisplayComponent {
  @Input({ required: true }) price!: number;
  @Input() salePrice?: number;
  @Input() salePercent?: number;
}
