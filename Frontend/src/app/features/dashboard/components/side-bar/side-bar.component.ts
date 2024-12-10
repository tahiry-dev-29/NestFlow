import { Component, inject, signal, computed } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { sideLeftBarState } from '../../store/signal.store';

@Component({
  selector: 'app-side-bar',
  imports: [CommonModule, RouterLinkActive, RouterLink],
  templateUrl: './side-bar.component.html',
  standalone: true,
  styleUrls: ['./side-bar.component.scss'],
})
export class SideBarComponent {
  private readonly router = inject(Router);

  sideLeftBarState = sideLeftBarState;
  sideRightbarState = signal(false);

  readonly isMobile = signal(window.innerWidth < 1024);

  readonly classes = computed(() => {
    const isOpened = this.sideRightbarState();

    return {
      listClass: isOpened ? 'rounded-7' : 'text-white',
      iconClass: isOpened ? 'text text-gray-800' : 'text-white',
      textClass: isOpened ? 'font-semibold text-gray-800' : 'font-semibold text-white',
      arrowClass: isOpened ? 'rotate-90 text text-gray-800' : 'text-white',

      menuIconClass: (route: string) => this.isActive(route) ? 'menu-icon-solid' : 'menu-icon-outline',
      textClassList: (route: string) => this.isActive(route) ? 'text' : 'text-gray-300 font-light',
    };
  });

  readonly dropdownClasses = computed(() => {
    const isOpened = this.sideRightbarState();
    return {
      listClasses: {
        'rounded-7': isOpened,
        'text-gray-300 font-light': !isOpened,
      },
      iconClasses: {
        text: isOpened,
        'text-gray-300 font-light': !isOpened,
      },
      textClasses: {
        text: isOpened,
        'text-gray-300 font-light': !isOpened,
      },
      arrowClasses: {
        '-rotate-90': isOpened,
        text: isOpened,
        'text-gray-300 font-light': !isOpened,
      },
    };
  });

  toggleDropdown() {
    this.sideRightbarState.set(!this.sideRightbarState());
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }
}
