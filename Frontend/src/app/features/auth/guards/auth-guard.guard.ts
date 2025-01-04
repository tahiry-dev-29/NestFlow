import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
    providedIn: 'root',
})
export class AuthGuard implements CanActivate {
    private authService = inject(AuthService);
    private router = inject(Router);

    canActivate(): boolean {
        if (this.authService.isAuthenticated()) {
            return true;
        }

        this.router.navigate(['/login'], {
            queryParams: { returnUrl: this.router.url },
        });
        return false;
    }
}
