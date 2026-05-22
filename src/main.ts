import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
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

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideHttpClient(),
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
  ],
});
