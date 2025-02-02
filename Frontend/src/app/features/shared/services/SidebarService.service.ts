import { Injectable, signal } from '@angular/core';
import { IUsers } from '../../users/models/users/users.module';

@Injectable({ providedIn: 'root' })
export class SidebarService {
  private _userToEdit = signal<IUsers | null>(null);
  private _userToView = signal<IUsers | null>(null);

  readonly userToEdit = this._userToEdit.asReadonly();
  readonly userToView = this._userToView.asReadonly();

  openEditSidebar(user: IUsers) {
    this._userToEdit.set(user);
  }

  openViewSidebar(user: IUsers) {
    this._userToView.set(user);
  }

  closeSidebars() {
    this._userToEdit.set(null);
    this._userToView.set(null);
  }
}