import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { ImageUrl } from '../../../../../../public/images/constant.images';
import { slideInOut } from '../../../shared/animations/animations';
import { PopupsComponent } from '../../../shared/components/popups/popups.component';
import { SideBarRightComponent } from '../../../shared/components/side-bar-right/side-bar-right.component';
import { IUsers } from '../../models/users/users.module';
import { UsersService } from '../../services/users.service';
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

    store = inject(UserStore);
    toastr = inject(ToastrService);
    usersService = inject(UsersService);


    ngOnInit() {
        this.usersService.getAll().subscribe((users) => {
            this.store.loadUsers(users);
        });
    }

    openSidebar(sidebar: 'edit' | 'view', user: IUsers): void {
        if (sidebar === 'edit') {
            this.userToEdit = user;
            this.showEditUserSidebar.set(true);
        } else {
            this.userToView = user;
            this.showViewUserSidebar.set(true);
        }
    }

    closeSidebar(sidebar: 'edit' | 'view'): void {
        if (sidebar === 'edit') {
            this.userToEdit = null;
            this.showEditUserSidebar.set(false);
        } else {
            this.userToView = null;
            this.showViewUserSidebar.set(false);
        }
    }

    confirmDelete(): void {
        if (this.userIdToDelete) {
            const userToDelete = this.store.getUserById(this.userIdToDelete);
            if (userToDelete) {
                this.store.deleteUser(this.userIdToDelete);
                this.toastr.success(
                    `User <span class="msg-class">${userToDelete.name}</span> deleted successfully`,
                    undefined,
                    { enableHtml: true }
                );
            }
            this.closePopup();
        }
    }

    closePopup(): void {
        this.showPopup.set(false);
        this.userIdToDelete = null;
    }

    openPopup(userId: string): void {
        this.userIdToDelete = userId;
        this.showPopup.set(true);
    }
}
