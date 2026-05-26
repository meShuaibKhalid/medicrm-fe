import { Injectable, inject } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly toastCtrl = inject(ToastController);

  async show(
    message: string,
    color: 'success' | 'danger' | 'warning' | 'primary' | 'medium' = 'primary',
    duration = 3000
  ) {
    // Dismiss any existing toast first to prevent stacking and overlap issues
    try {
      const topToast = await this.toastCtrl.getTop();
      if (topToast) {
        await topToast.dismiss();
      }
    } catch {
      // Ignore if no toast is present
    }

    const toast = await this.toastCtrl.create({
      message,
      duration,
      position: 'bottom',
      color,
      cssClass: `custom-toast toast-${color}`,
      buttons: [
        {
          text: '✕',
          role: 'cancel',
        },
      ],
    });
    await toast.present();
  }

  async success(message: string, duration = 3000) {
    await this.show(message, 'success', duration);
  }

  async error(message: string, duration = 4000) {
    await this.show(message, 'danger', duration);
  }

  async warning(message: string, duration = 3500) {
    await this.show(message, 'warning', duration);
  }

  async info(message: string, duration = 3000) {
    await this.show(message, 'primary', duration);
  }
}
