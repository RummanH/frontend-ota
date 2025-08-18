import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Documentation } from './app/pages/documentation/documentation';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';
import { ProfileComponent } from './app/pages/profile/profile.component';
import { RetrievedTicketComponent } from './app/pages/retrieved-ticket/retrieved-ticket.component';
import { loginGuard } from './app/_guard/signin.guard';
import { authGuard } from './app/_guard/auth.guard';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        children: [
            { path: '', component: Dashboard },
            { path: 'profile', component: ProfileComponent },
            { path: 'tickets', component: RetrievedTicketComponent },
            // { path: 'uikit', loadChildren: () => import('./app/pages/uikit/uikit.routes') },
            { path: 'settings', loadChildren: () => import('./app/pages/settings/settings.routes') },
            { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') }
        ],
        canActivate: [authGuard]
    },
    // { path: 'landing', component: Landing },
    { path: 'notfound', component: Notfound },
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes'), canActivate: [loginGuard] },
    { path: '**', redirectTo: '/notfound' }
];
