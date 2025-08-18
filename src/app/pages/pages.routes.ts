import { Routes } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';

export default [
  { path: 'profile', component: ProfileComponent },
  { path: '**', redirectTo: '/notfound' },
] as Routes;
