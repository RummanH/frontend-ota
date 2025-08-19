import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PreloaderComponent } from './app/common-module/component/preloader/preloader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, PreloaderComponent],
  template: `<div>
    <router-outlet></router-outlet>
    <app-preloader />
  </div>`,
})
export class AppComponent {}
