import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit, computed, inject, signal, viewChild } from '@angular/core';
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
export class UserTableComponent implements OnInit{
    addUserSidebar = viewChild<SideBarRightComponent>('addUserSidebar');
    editUserSidebar = viewChild<SideBarRightComponent>('editUserSidebar');
    viewUserSidebar = viewChild<SideBarRightComponent>('viewUserSidebar');

    protected readonly UserEntity = UserEntity;
    readonly defaultImages = ImageUrl.defaultImages;
    readonly store = inject(UserStore);
    
    // Signaux
    private _userToEdit = signal<IUsers | null>(null);
    private _userToView = signal<IUsers | null>(null);
    private _userIdToDelete = signal<string | null>(null);
    currentPage = signal<number>(1);
    private _showPopup = signal(false);

    // Signaux publics en lecture seule
    readonly userToEdit = computed(() => this._userToEdit());
    readonly userToView = computed(() => this._userToView());
    readonly showPopup = computed(() => this._showPopup());


    // Actions map pour le sidebar
    private readonly sidebarActions: Record<string, (user?: IUsers) => { sidebar: SideBarRightComponent | undefined; title: string }> = {
        add: () => ({
            sidebar: this.addUserSidebar(),
            title: 'Add User'
        }),
        edit: (user?: IUsers) => {
            if (!user) return { sidebar: undefined, title: '' };
            this._userToEdit.set(user);
            return {
                sidebar: this.editUserSidebar(),
                title: 'Edit User'
            };
        },
        view: (user?: IUsers) => {
            if (!user) return { sidebar: undefined, title: '' };
            this._userToView.set(user);
            return {
                sidebar: this.viewUserSidebar(),
                title: 'View User'
            };
        }
    };

    // Get role classes
    getRoleClasses(role: UserEntity.ROLE): string {
        const classes = {
            'ADMIN': 'bg-blue-500/10 text-blue-500',
            'USER': 'bg-green-500/10 text-green-500',
        };
        return classes[role as unknown as keyof typeof classes] || 'bg-gray-500/10 text-gray-500';
    }

    // On init
    ngOnInit() {
        this.store.loadUsers(this.store.users()); 
    }

    // Toggle sidebar
    toggleSidebar(action: keyof typeof this.sidebarActions, user?: IUsers): void {
        const sidebarAction = this.sidebarActions[action];
        if (!sidebarAction) return;

        this.closeSidebars();

        const result = action === 'add' ? sidebarAction() : user ? sidebarAction(user) : null;
        if (!result?.sidebar) {
            return;
        }

        setTimeout(() => {
            if (result.sidebar) {
                result.sidebar.setTitle(result.title);
                result.sidebar.setIsOpen(true);
            }
        }, 100);
    }

    // Close sidebars
    private closeSidebars(): void {
        const sidebars = [
            this.addUserSidebar(),
            this.editUserSidebar(),
            this.viewUserSidebar()
        ];

        sidebars.forEach(sidebar => {
            if (sidebar) {
                sidebar.setIsOpen(false);
                sidebar.setTitle('');
            }
        });
    }

    handleImageError(event: any) {
        event.target.src = this.defaultImages;
    }

    openPopup(userId: string): void {
        this._userIdToDelete.set(userId);
        this._showPopup.set(true);
    }

    closePopup(): void {
        this._userIdToDelete.set(null);
        this._showPopup.set(false);
    }

    // Confirm delete
    confirmDelete(): void {
        const userId = this._userIdToDelete();
        if (userId) {
            this.store.deleteUser(userId);
            this.closePopup();
            this.store.loadUsers(this.store.users());
        }
    }

    // On user added
    onUserAdded(): void {
        const sidebar = this.addUserSidebar();
        if (sidebar) {
            sidebar.setIsOpen(false);
            this.store.loadUsers(this.store.users());
        }
    }
    // On user edited
    onUserEdited(): void {
        const sidebar = this.editUserSidebar();
        if (sidebar) {
            sidebar.setIsOpen(false);
            this._userToEdit.set(null);
            this.store.loadUsers(this.store.users());
        }
    }

    onUserViewed(): void {
        const sidebar = this.viewUserSidebar();
        if (sidebar) {
            sidebar.setIsOpen(false);
            this._userToView.set(null);
        }
    }

    setPage(page: number): void {
        this.currentPage.set(page);
    }

    getCurrentPage(): number {
        return this.currentPage();
    }
}
