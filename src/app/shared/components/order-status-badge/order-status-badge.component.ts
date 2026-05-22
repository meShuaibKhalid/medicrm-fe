import { TitleCasePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IonBadge } from '@ionic/angular/standalone';
import { OrderStatus } from '../../models/app.models';

@Component({
  selector: 'app-order-status-badge',
  standalone: true,
  imports: [IonBadge, TitleCasePipe],
  template: `<ion-badge [color]="color">{{ status | titlecase }}</ion-badge>`,
})
export class OrderStatusBadgeComponent {
  @Input({ required: true }) status!: OrderStatus;

  get color(): string {
    switch (this.status) {
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'danger';
      case 'confirmed':
        return 'secondary';
      case 'dispatched':
        return 'warning';
      default:
        return 'medium';
    }
  }
}
