import { Routes } from '@angular/router';
import { LayoutComponent } from './app/common-module/component/layout/layout.component';
import { Dashboard } from './app/page-module/dashboard/dashboard';
import { Notfound } from './app/page-module/notfound/notfound';

export const appRoutes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: Dashboard },
      { path: 'pages', loadChildren: () => import('./app/page-module/pages.routes') },
      { path: 'auth', loadChildren: () => import('./app/auth-module/auth.routes') },
    ],
  },

  { path: 'notfound', component: Notfound },
  { path: '**', redirectTo: '/notfound' },
];
