import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { ImageUrl } from '../../../../../../public/images/constant.images';
import { slideInOut } from '../../../shared/animations/animations';
import { PopupsComponent } from '../../../shared/components/popups/popups.component';
import { SideBarRightComponent } from '../../../shared/components/side-bar-right/side-bar-right.component';
import { IUsers, UserStore } from '../../store/users.store';
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
    template: `
        <main class="relative overflow-hidden">
    <div class="flex flex-wrap -mx-3">
        <div class="flex-none w-full max-w-full px-3">
            <div
                class="relative flex flex-col min-w-0 mb-6 p-2 break-words border-0 border-transparent border-solid bg-slate-850 shadow-dark-xl rounded-2xl bg-clip-border">
                <div
                    class="flex justify-between items-center p-3 mb-0 border-b-2 border-gray-600 rounded-t-2xl border-b-transparent">
                    <h6 class="text-white text-xl font-semibold">Users Table</h6>
                    <button type="button"
                        class="bg-gradient-to-r from-pink-500/90 to-violet-500/90 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg hover:text transition-all duration-300 ease-in-out transform hover:-translate-y-1"
                        (click)="showAddUserSidebar.set(true)">
                        <span class="flex items-center">
                            <i class="material-icons mr-2">add</i>
                            Add User
                        </span>
                    </button>
                </div>
                <div class="flex-auto px-0 pt-0 pb-2">
                    <div class="p-0 overflow-x-auto">
                        <div class="h-[65vh] overflow-auto custom-scrolbar">
                            <table
                                class="items-center w-full mb-0 align-top border-collapse border-white/40 text-slate-500">
                                <thead
                                    class="sticky top-0 z-50 bg-slate-850/25 backdrop-blur-md border-b-2 border-gray-200">
                                    <tr>
                                        <th class="p-2 text-left user-th">User</th>
                                        <th class="p-2 text-left user-th">Full Name</th>
                                        <th class="p-2 text-left user-th">Email</th>
                                        <th class="p-2 text-center user-th">Status</th>
                                        <th class="p-2 text-center user-th">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                @for (user of users() | paginate: { itemsPerPage: 10, currentPage: p }; track user.id; let i = $index) {
                                    <tr *ngIf="store.loading()">
                                    <td colspan="5" class="text-center p-4">
                                        <div class="flex items-center justify-center">
                                        <div class="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status">
                                            <span class="sr-only">Loading...</span>
                                        </div>
                                        </div>
                                    </td>
                                    </tr>
                                    <tr>
                                        <td
                                            class="p-2 align-middle bg-transparent border-b border-white/40 whitespace-nowrap shadow-transparent">
                                            <div class="flex px-2 py-1">
                                                <img [src]="user.imageUrl ? user.imageUrl : defaultImages"
                                                    [alt]="user.firstName" loading="lazy" decoding="async"
                                                    class="inline-flex items-center justify-center mr-4 text-sm text-white transition-all duration-200 ease-in-out h-9 w-9 rounded-xl">
                                            </div>
                                        </td>
                                        <td
                                            class="p-2 align-middle bg-transparent border-b border-white/40 whitespace-nowrap shadow-transparent">
                                            <p class="mb-0 text-xs leading-tight text-white opacity-80">{{ user.name }}</p>
                                        </td>
                                        <td
                                            class="p-2 align-middle bg-transparent border-b border-white/40 whitespace-nowrap shadow-transparent">
                                            <p class="mb-0 text-xs leading-tight text-white opacity-80">{{ user.mail }}
                                            </p>
                                        </td>
                                        <td
                                            class="p-2 text-sm leading-normal text-center align-middle bg-transparent border-b border-white/40 whitespace-nowrap shadow-transparent">
                                            <span [ngClass]="store.userStatusClass()(user.online)"
                                                class="px-2.5 text-xs rounded-1.8 py-1.4 inline-block whitespace-nowrap text-center align-baseline font-bold uppercase leading-none text-white">
                                                {{ user.online ? 'Online' : 'Offline' }}
                                            </span>
                                        </td>
                                        <td
                                            class="p-2 align-middle bg-transparent border-b border-white/40 whitespace-nowrap shadow-transparent text-center">
                                            <button class="tooltip hover:text text-red-600 mr-2"
                                                (click)="openPopup(user.id)">
                                                <span class="material-icons">delete</span>
                                            </button>
                                            <button class="tooltip hover:text text-blue-600 mr-2"
                                                (click)="openEditSidebar(user)">
                                                <span class="material-icons">edit</span>
                                            </button>
                                            <button class="tooltip hover:text text-slate-600"
                                                (click)="openViewSidebar(user)">
                                                <span class="material-icons">visibility</span>
                                            </button>
                                        </td>
                                    </tr>
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div
                    class="sticky left-0 bottom-0 border-t-2 border-gray-600 z-50 w-full flex justify-between items-center text-white bg-slate-850 py-2 px-4">
                    <p>Total users <span class="text text-lg font-bold">{{ store.totalUsers() }}</span></p>
                    <pagination-controls (pageChange)="p = $event" class="text-white"></pagination-controls>
                </div>

            </div>
        </div>
    </div>
    <app-side-bar-right [isOpen]="showAddUserSidebar()" [title]="'Add User'"
        (closeEvent)="showAddUserSidebar.set(false)" (clickOutside)="showAddUserSidebar.set(false)">
        <div class="min-w-full">
            <app-add-user (userAdded)="showAddUserSidebar.set(false)"></app-add-user>
        </div>
    </app-side-bar-right>

    <app-side-bar-right [isOpen]="showEditUserSidebar()" [title]="'Edit User'"
        (closeEvent)="closeEditSidebar()" (clickOutside)="closeEditSidebar()">
        <div class="w-85">
            <app-edit-user [user]="userToEdit"></app-edit-user>
        </div>
    </app-side-bar-right>

    <app-side-bar-right [isOpen]="showViewUserSidebar()" [title]="'View User'"
        (closeEvent)="closeViewSidebar()" (clickOutside)="closeViewSidebar()">
        <div class="w-85">
            <app-view-user [user]="userToView"></app-view-user>
        </div>
    </app-side-bar-right>
</main>

<app-popups *ngIf="showPopup()" (confirm)="confirmDelete()" (cancel)="closePopup()" />
    `,
    styleUrls: ['./user-table.component.scss'],
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
    userIdToDelete: string | null = null;

    readonly store = inject(UserStore);
    readonly defaultImages = ImageUrl.defaultImages;
    private readonly toastr = inject(ToastrService);
    p: number = 1;

    readonly users = this.store.users;

    ngOnInit() {
        this.store.loadUsers;
    }



    openEditSidebar(user: IUsers): void {
        this.userToEdit = user;
        this.showEditUserSidebar.set(true);
        console.log(this.userToEdit);
    }

    openViewSidebar(user: IUsers): void {
        this.userToView = user;
        this.showViewUserSidebar.set(true);
    }

    closeViewSidebar(): void {
        this.showViewUserSidebar.set(false);
    }

    closeEditSidebar(): void {
        this.userToEdit = null;
        this.showEditUserSidebar.set(false);
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
