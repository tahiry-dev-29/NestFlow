import { Component, computed, inject, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { ImageUrl } from '../../../../../../public/images/constant.images';
import { slideInOut } from '../../../shared/animations/animations';
import { PopupsComponent } from '../../../shared/components/popups/popups.component';
import { SideBarRightComponent } from '../../../shared/components/side-bar-right/side-bar-right.component';
import { IUsers, ROLE } from '../../models/users/users.module';
import { UserStore } from '../../store/users.store';
import { AddUserComponent } from '../add-user/add-user.component';
import { EditUserComponent } from '../edit-user/edit-user.component';
import { ViewUserComponent } from '../view-user/view-user.component';

@Component({
  selector: 'app-user-table',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    PopupsComponent,
    SideBarRightComponent,
    AddUserComponent,
    EditUserComponent,
    ViewUserComponent,
  ],
  templateUrl: './user-table.component.html',
  styleUrls: ['./user-table.component.scss'],
  animations: [slideInOut],
})
export class UserTableComponent {
  @ViewChild('addUserSidebar') addUserSidebar!: SideBarRightComponent;
  @ViewChild('editUserSidebar') editUserSidebar!: SideBarRightComponent;
  @ViewChild('viewUserSidebar') viewUserSidebar!: SideBarRightComponent;
  
  protected readonly UserEntity = ROLE;
  readonly defaultImages = ImageUrl.defaultImages;
  readonly store = inject(UserStore);
  private readonly toastr = inject(ToastrService);
  
  // Signaux pour l’utilisateur à éditer ou à visualiser
  private _userToEdit = signal<IUsers | null>(null);
  private _userToView = signal<IUsers | null>(null);
  private _userIdToDelete = signal<string | null>(null);
  currentPage = signal<number>(1);
  private _showPopup = signal(false);
  
  readonly userToEdit = computed(() => this._userToEdit());
  readonly userToView = computed(() => this._userToView());
  readonly showPopup = computed(() => this._showPopup());
  
  private readonly sidebarActions: Record<string, (user?: IUsers) => { sidebar: SideBarRightComponent | undefined; title: string }> = {
    add: () => ({
      sidebar: this.addUserSidebar,
      title: 'Add User'
    }),
    edit: (user?: IUsers) => {
      if (!user) return { sidebar: undefined, title: '' };
      this._userToEdit.set(user);
      return {
        sidebar: this.editUserSidebar,
        title: 'Edit User'
      };
    },
    view: (user?: IUsers) => {
      if (!user) return { sidebar: undefined, title: '' };
      this._userToView.set(user);
      return {
        sidebar: this.viewUserSidebar,
        title: 'View User'
      };
    }
  };
  
  ngOnInit() {
    this.store.loadUsers([]);
  }
    
    getRoleClasses(role: ROLE): string {
        const classes = {
            'ADMIN': 'bg-blue-500/10 text-blue-500',
            'USER': 'bg-green-500/10 text-green-500',
        };
        return classes[role as unknown as keyof typeof classes] || 'bg-gray-500/10 text-gray-500';
    }
  
  toggleSidebar(action: keyof typeof this.sidebarActions, user?: IUsers): void {
    const sidebarAction = this.sidebarActions[action];
    if (!sidebarAction) return;
    
    this.closeSidebars();
    const result = action === 'add' ? sidebarAction() : user ? sidebarAction(user) : null;
    if (!result?.sidebar) return;
    
    setTimeout(() => {
      if (result.sidebar) {
        result.sidebar.setTitle(result.title);
        result.sidebar.setIsOpen(true);
      }
    }, 100);
  }
  
  private closeSidebars(): void {
    const sidebars = [this.addUserSidebar, this.editUserSidebar, this.viewUserSidebar];
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
  
  confirmDelete(): void {
    const userId = this._userIdToDelete();
    const user = userId ? this.store.getUserById(userId) : null;
    if (userId && user) {
      this.store.deleteUser(userId);
      this.closePopup();
      this.toastr.success(`<span class="msg-class">${user.firstName}</span> deleted successfully`, '', {
        timeOut: 3000,
        positionClass: 'toast-bottom-center',
        closeButton: false,
        tapToDismiss: true,
      });
      this.store.loadUsers(this.store.users());
    }
  }
  
  onUserAdded(): void {
    if (this.addUserSidebar) {
      this.addUserSidebar.setIsOpen(false);
      this.store.loadUsers(this.store.users());
    }
  }
  
  onUserEdited(): void {
    if (this.editUserSidebar) {
      this.editUserSidebar.setIsOpen(false);
      this._userToEdit.set(null);
      this.store.loadUsers(this.store.users());
    }
  }
  
  onUserViewed(): void {
    if (this.viewUserSidebar) {
      this.viewUserSidebar.setIsOpen(false);
      this._userToView.set(null);
    }
  }
  
  setPage(page: number): void {
    this.currentPage.set(page);
  }
}
