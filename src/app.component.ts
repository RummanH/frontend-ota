import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PreloaderComponent } from './app/shared/components/preloader/preloader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, PreloaderComponent],
  template: `<ng-container>
    <router-outlet></router-outlet>
    <app-preloader />
  </ng-container>`,
})
export class AppComponent {}
