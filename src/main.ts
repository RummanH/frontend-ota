import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app.config';
import { AppComponent } from './app.component';
import { environment } from './environments/environment';

if (window && environment.production) {
  window.console.log = function () {};
}

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
