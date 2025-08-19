import { Routes } from '@angular/router';
import { LayoutComponent } from './app/layout/layout/layout.component';

export const appRoutes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'users', loadChildren: () => import('./app/features/users/users.routes') },
      { path: 'pages', loadChildren: () => import('./app/features/flights/flights.routes') },
    ],
  },
  { path: '**', redirectTo: '/notfound' },
];
