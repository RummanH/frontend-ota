import { Routes } from '@angular/router';
import { Documentation } from './documentation/documentation';
import { Crud } from './crud/crud';
import { Empty } from './empty/empty';
import { ProfileComponent } from './profile/profile.component';
import { FlightSearchComponent } from './flight-search/flight-search.component';
import { FlightListComponent } from './flight-list/flight-list.component';
import { SubUserComponent } from './sub-user/sub-user.component';

export default [
    // { path: 'documentation', component: Documentation },
    { path: 'profile', component: ProfileComponent },
    { path: 'flight-search', component: FlightSearchComponent },
    { path: 'flight-list', component: FlightListComponent },
    { path: 'sub-user', component: SubUserComponent },
    // { path: 'crud', component: Crud },
    // { path: 'empty', component: Empty },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
