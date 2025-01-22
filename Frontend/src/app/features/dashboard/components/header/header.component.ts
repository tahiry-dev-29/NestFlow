import { Component, inject } from '@angular/core';
import { ImageUrl } from '../../../../../../public/images/constant.images';
import { AuthService } from '../../../auth/services/auth.service';
import { IUsers } from '../../../users/models/users/users.module';
import { sideLeftBarState } from '../../store/signal.store';


@Component({
  selector: 'app-header',
  imports: [],
  template: `
    <nav class="flex flex-nowrap w-full items-center gap-3 justify-between text-white">
      <section class="flex items-center gap-3">
      <button (click)="toggleSidebar()" class="text-white flex items-center group">
        <span class="material-icons text-3xl transition-transform duration-100 ease-in-out group-hover:text group-hover:scale-90 w-10 group-hover:transform-cpu">
          menu
        </span>
      </button>
      @let title = "NEST FLOW";
      <span class="font-bold text-2xl sm:text-3xl text-uppercase text">{{ title }}</span>
      </section>
      <section class="flex items-center gap-3">
        <button class="text-white flex items-center group">
          <span class="material-icons text-3xl transition-transform duration-100 ease-in-out group-hover:text group-hover:scale-90 w-10 group-hover:transform-cpu">
            notifications
          </span>
        </button>
        <div class="flex items-center cursor-pointer gap-3 transition-transform duration-300 ease-in-out"> 
          <span class="text-white font-semibold ml-2">{{ user?.role }}</span>
          <img [src]="getImageSrc()" alt="Profile" class="w-12 h-12 rounded-full border-2 border-gray-500/13 hover:scale-110">
        </div>
      </section>
    </nav>

  `,
  styleUrl: './header.component.scss',
  standalone: true,

})
export class HeaderComponent {
  sidebarState = sideLeftBarState;
  user: IUsers | null = null;
  defaultImages = ImageUrl.defaultImages;

  authService= inject(AuthService);

  ngOnInit(): void {
    this.loadUserProfile();
  }

  getImageSrc(): string {
    const imageUrl = this.user?.imageUrl;
    if (!imageUrl) return this.defaultImages;

    if (imageUrl.startsWith('data:') || imageUrl.startsWith('../')) {
      return imageUrl;
    }

    return `http://localhost:8080/api/images/upload/${imageUrl}`;
  }

  loadUserProfile(): void {
    const token = this.authService.getToken();
    this.authService.getUserByToken(token || '').subscribe({
      next: (user) => {
        this.user = user;
      }
    });
  }

  
  toggleSidebar(): void {
    this.sidebarState.update(state => !state);
  }
}
