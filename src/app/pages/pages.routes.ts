import { Routes } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
import { FlightSearchComponent } from './flight-search/flight-search.component';
import { FlightListComponent } from './flight-list/flight-list.component';

export default [
  { path: 'profile', component: ProfileComponent },
  { path: 'flight-search', component: FlightSearchComponent },
  { path: 'flight-list', component: FlightListComponent },
  { path: '**', redirectTo: '/notfound' },
] as Routes;
