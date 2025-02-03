import { tap } from 'rxjs';
import { Component, ElementRef, HostListener, inject, signal, ViewChild } from '@angular/core';
import { ImageUrl } from '../../../../../../public/images/constant.images';
import { AuthService } from '../../../auth/services/auth.service';
import { IUsers } from '../../../users/models/users/users.module';
import { sideLeftBarState } from '../../store/signal.store';
import { expandCollapse } from '../../../shared/animations/animations';
import { AuthStore } from '../../../auth/store/auth.store';
import { SideBarRightComponent } from '../../../shared/components/side-bar-right/side-bar-right.component';
import { EditUserComponent } from '../../../users/components/edit-user/edit-user.component';
import { ViewUserComponent } from '../../../users/components/view-user/view-user.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [SideBarRightComponent, EditUserComponent, ViewUserComponent, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [expandCollapse],
})
export class HeaderComponent {
  sidebarState = sideLeftBarState;
  user: IUsers | null = null;
  defaultImages = ImageUrl.defaultImages;
  authService = inject(AuthService);
  authStore = inject(AuthStore);
  isDropdownOpen = signal(false);
  
  @ViewChild('editUserSidebar') editUserSidebar!: SideBarRightComponent;
  @ViewChild('viewUserSidebar') viewUserSidebar!: SideBarRightComponent;
  
  userToEdit = signal<IUsers | null>(null);
  userToView = signal<IUsers | null>(null);
  
  constructor(private elementRef: ElementRef) {}
  
  ngOnInit(): void {
    this.loadUserProfile();
  }
  
  getImageSrc(): string {
    const imageUrl = this.user?.imageUrl;
    return imageUrl ? `http://localhost:8080/api/images/upload/${imageUrl}` : this.defaultImages;
  }
  
  loadUserProfile(): void {
    const token = this.authService.getToken();
    this.authService.getUserByToken(token || '').subscribe({
      next: (user) => { this.user = user; }
    });
  }
  
  toggleSidebar(): void {
    this.sidebarState.update(state => !state);
  }
  
  toggleDropdown(): void {
    this.isDropdownOpen.update(state => !state);
  }
  
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen.set(false);
    }
  }
  
  viewProfile(): void {
    if (this.user) {
      this.userToView.set(this.user);
      // On attend que la référence à la sidebar soit prête
      setTimeout(() => {
        if (this.viewUserSidebar) {
          this.viewUserSidebar.setIsOpen(true);
        }
      }, 0);
    }
    this.isDropdownOpen.set(false);
  }
  
  editProfile(): void {
    if (this.user) {
      this.userToEdit.set(this.user);
      setTimeout(() => {
        if (this.editUserSidebar) {
          this.editUserSidebar.setIsOpen(true);
        }
      }, 0);
    }
    this.isDropdownOpen.set(false);
  }
  
  logout(): void {
    this.authStore.logout();
    this.isDropdownOpen.set(false);
  }
  
  onUserEdited(): void {
    if (this.editUserSidebar) {
      this.editUserSidebar.setIsOpen(false);
    }
    this.userToEdit.set(null);
    // Recharger éventuellement le profil
    this.loadUserProfile();
  }
  
  onUserViewed(): void {
    if (this.viewUserSidebar) {
      this.viewUserSidebar.setIsOpen(false);
    }
    this.userToView.set(null);
  }
}