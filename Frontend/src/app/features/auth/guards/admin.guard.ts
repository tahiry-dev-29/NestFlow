import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { map, Observable } from 'rxjs';
import { ROLE } from '../../users/models/users/users.module';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  readonly authService = inject(AuthService);
  readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);

  canActivate(): Observable<boolean> {
    return this.authService.getCurrentUserRole().pipe(
      map(role => {
        if (role === ROLE.ADMIN) {
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