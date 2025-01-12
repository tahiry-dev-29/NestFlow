import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { ImageUrl } from '../../../../../../public/images/constant.images';
import { slideInOut } from '../../../shared/animations/animations';
import { PopupsComponent } from '../../../shared/components/popups/popups.component';
import { SideBarRightComponent } from '../../../shared/components/side-bar-right/side-bar-right.component';
import { IUsers, UserEntity } from '../../models/users/users.module';
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
    protected UserEntity = UserEntity;
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

    ngOnInit() {
        this.store.loadUsers([]); 
    }

    toggleSidebar(sidebar: 'add' | 'edit' | 'view', user?: IUsers): void {
        switch (sidebar) {
            case 'add':
                this.showAddUserSidebar.set(true);
                this.showEditUserSidebar.set(false);
                this.showViewUserSidebar.set(false);
                break;
            case 'edit':
                if (user) {
                    this.userToEdit = user;
                    this.showEditUserSidebar.set(true);
                    this.showAddUserSidebar.set(false);
                    this.showViewUserSidebar.set(false);
                }
                break;
            case 'view':
                if (user) {
                    this.userToView = user;
                    this.showViewUserSidebar.set(true);
                    this.showAddUserSidebar.set(false);
                    this.showEditUserSidebar.set(false);
                }
                break;
        }
    }

    handleImageError(event: any) {
        event.target.src = this.defaultImages;
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
            this.store.loadUsers([]);
        }
    }

    onUserAdded(): void {
        this.showAddUserSidebar.set(false);
        this.store.loadUsers([]);
    }

    onUserEdited(): void {
        this.showEditUserSidebar.set(false);
        this.userToEdit = null;
        this.store.loadUsers([]);
    }

    onUserViewed(): void {
        this.showViewUserSidebar.set(false);
        this.userToView = null;
    }
}

