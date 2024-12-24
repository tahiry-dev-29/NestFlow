import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private isAdminUser = true;

  constructor(private router: Router, private toastr: ToastrService) { }

  isAdmin(): boolean {
    return this.isAdminUser;
  }

  login(username: string, password: string): Observable<boolean> {
    return of(username === 'admin' && password === 'adminPassword').pipe(
      delay(1000),
      tap((isAdmin: boolean) => {
        if (isAdmin) {
          this.isAdminUser = true;
          this.toastr.success('Logged in successfully as admin');
        } else {
          this.isAdminUser = false;
          this.toastr.info('Logged in as regular user');
        }
      })
    );
  }

  logout(): Observable<void> {
    return of(void 0).pipe(
      delay(500),
      tap(() => {
        this.isAdminUser = false;
        this.toastr.info('Logged out successfully');
        this.router.navigate(['/login']);
      })
    );
  }
}
