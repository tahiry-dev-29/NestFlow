import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AdminService } from '../services/admin.service';
import { ToastrService } from 'ngx-toastr';

export const adminGuard: CanActivateFn = (route, state) => {
  const adminService = inject(AdminService);
  const toastr = inject(ToastrService);

  if (adminService.isAdmin()) {
    return true;
  } else {
    toastr.error('You do not have permission to access this page.');
    return false;
  }
};
