import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { ImageUrl } from '../../../../../../public/images/constant.images';
import { slideInOut } from '../../../shared/animations/animations';
import { PopupsComponent } from '../../../shared/components/popups/popups.component';
import { SideBarRightComponent } from '../../../shared/components/side-bar-right/side-bar-right.component';
import { IUsers } from '../../models/users/users.module';
import { UserStore } from '../../store/users.store';
import { AddUserComponent } from '../add-user/add-user.component';
import { EditUserComponent } from '../edit-user/edit-user.component';
import { ViewUserComponent } from '../view-user/view-user.component';

@Component({
    selector: 'app-user-table',
    standalone: true,
    imports: [
        CommonModule,
        AddUserComponent,
        PopupsComponent,
        NgxPaginationModule,
        ReactiveFormsModule,
        SideBarRightComponent,
        EditUserComponent,
        ViewUserComponent,
    ],
    templateUrl: './user-table.component.html',
    styleUrls: ['./user-table.component.scss'],
    animations: [slideInOut],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class UserTableComponent implements OnInit {
  showAddUserSidebar = signal(false);
  showEditUserSidebar = signal(false);
  showViewUserSidebar = signal(false);
  showPopup = signal(false);

  userToEdit: IUsers | null = null;
  userToView: IUsers | null = null;
  userIdToDelete: string | null = null;

  readonly defaultImages = ImageUrl.defaultImages;
  p: number = 1;

  readonly store = inject(UserStore);
  readonly userStore = inject(UserStore);

  ngOnInit() {
    this.store.loadUsers([]); 
  }

  handleImageError(event: any) {
    event.target.src = this.defaultImages;
  }

  toggleSidebar(sidebar: 'edit' | 'view', user?: IUsers): void {
    if (sidebar === 'edit') {
      this.userToEdit = user || null;
      this.showEditUserSidebar.set(!!user);
    } else {
      this.userToView = user || null;
      this.showViewUserSidebar.set(!!user);
    }
  }

  openPopup(userId: string): void {
    this.userIdToDelete = userId;
    this.showPopup.set(true);
  }

  closePopup(): void {
    this.showPopup.set(false);
    this.userIdToDelete = null;
  }

  confirmDelete(): void {
    if (this.userIdToDelete) {
      this.store.deleteUser(this.userIdToDelete);
      this.closePopup();
      this.userStore.loadUsers([]);
    }
  }
}

