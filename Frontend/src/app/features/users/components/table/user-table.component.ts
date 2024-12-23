import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { ImageUrl } from '../../../../../../public/images/constant.images';
import { slideInOut } from '../../../shared/animations/animations';
import { PopupsComponent } from "../../../shared/components/popups/popups.component";
import { SideBarRightComponent } from '../../../shared/components/side-bar-right/side-bar-right.component';
import { IUsers, UserStore } from '../../store/users.store';
import { AddUserComponent } from "../add-user/add-user.component";
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
    styleUrl: './user-table.component.scss',
    animations: [slideInOut],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class UserTableComponent {
    showAddUserSidebar = signal(false);
    showEditUserSidebar = signal(false);
    showViewUserSidebar = signal(false);
    showPopup = signal(false);

    userToEdit: IUsers | null = null;
    userToView: IUsers | null = null;
    userIdToDelete: number | null = null;
    p: number = 1;

    readonly store = inject(UserStore);
    readonly defaultImages = ImageUrl.defaultImages;
    private readonly toastr = inject(ToastrService);

    readonly users = this.store.users;

    openEditSidebar(user: IUsers): void {
        this.userToEdit = user;
        this.showEditUserSidebar.set(true);
        console.log(this.userToEdit);
    }

    openViewSidebar(user: IUsers): void {
        this.userToView = user;
        this.showViewUserSidebar.set(true);
    }

    closeViewSidebar() {
        this.showViewUserSidebar.set(false);
    }

    closeEditSidebar(): void {
        this.userToEdit = null;
        this.showEditUserSidebar.set(false);
    }

    confirmDelete() {
        if (this.userIdToDelete !== null) {
            const userToDelete = this.store.getUserById(this.userIdToDelete);
            if (userToDelete) {
                this.store.deleteUser(this.userIdToDelete);
                this.toastr.success(
                    `User <span class="msg-class">${userToDelete.fullname}</span> deleted successfully`
                );
            }
            this.closePopup();
        }
    }

    closePopup() {
        this.showPopup.set(false);
        this.userIdToDelete = null;
    }

    openPopup(userId: number) {
        this.userIdToDelete = userId;
        this.showPopup.set(true);
    }
}
