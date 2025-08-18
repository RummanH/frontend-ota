// login.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../layout/service/auth.service';

export const loginGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.loggedIn()) {
        return true;
    } else {
        router.navigate(['/']);
        return false;
    }
};
