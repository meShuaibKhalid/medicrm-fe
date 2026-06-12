import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';
import { notificationInterceptor } from './app/core/interceptors/notification.interceptor';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  appsOutline,
  arrowBackOutline,
  bagAddOutline,
  bagHandleOutline,
  cartOutline,
  checkmarkCircleOutline,
  chevronBackOutline,
  chevronDownOutline,
  chevronForwardOutline,
  cubeOutline,
  gridOutline,
  heartOutline,
  homeOutline,
  locationOutline,
  medicalOutline,
  medkitOutline,
  personOutline,
  radioButtonOnOutline,
  receiptOutline,
  shieldCheckmarkOutline,
} from 'ionicons/icons';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { register } from 'swiper/element/bundle';

addIcons({
  'apps-outline': appsOutline,
  'arrow-back-outline': arrowBackOutline,
  'bag-add-outline': bagAddOutline,
  'bag-handle-outline': bagHandleOutline,
  'cart-outline': cartOutline,
  'checkmark-circle-outline': checkmarkCircleOutline,
  'chevron-back-outline': chevronBackOutline,
  'chevron-down-outline': chevronDownOutline,
  'chevron-forward-outline': chevronForwardOutline,
  'cube-outline': cubeOutline,
  'grid-outline': gridOutline,
  'heart-outline': heartOutline,
  'home-outline': homeOutline,
  'location-outline': locationOutline,
  'medical-outline': medicalOutline,
  'medkit-outline': medkitOutline,
  'person-outline': personOutline,
  'radio-button-on-outline': radioButtonOnOutline,
  'receipt-outline': receiptOutline,
  'shield-checkmark-outline': shieldCheckmarkOutline,
});
register();
bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideHttpClient(withInterceptors([authInterceptor, notificationInterceptor])),
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
  ],
});
