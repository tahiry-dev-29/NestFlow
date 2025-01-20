import { CanActivate, Router } from '@angular/router';
import { inject, Injectable } from '@angular/core';
import { AdminService } from '../services/admin.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../services/auth.service';
import { IUsers, ROLE } from '../../users/models/users/users.module';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  readonly authService = inject(AuthService);
  readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);

  loadUserProfile(): Observable<IUsers | null> {
    const token = this.authService.getToken();
    return this.authService.getUserByToken(token || '');
  }

  canActivate(): Observable<boolean> {
    return this.loadUserProfile().pipe(
      map(user => {
        if (user?.role.toString() === 'ADMIN') {
          return true;
        } else {
          if (!this.toastr.currentlyActive) {
            this.toastr.warning(`This page is only accessible to <span class="msg-class">admins</span>`, 'Access Denied');
          }
          this.router.navigate(['/dashboard/overview']);
          return false;
        }
      })
    );
  }
}