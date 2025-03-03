import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  inject,
  signal,
  WritableSignal,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ImageUrl } from '../../../../../../public/images/constant.images';
import { AuthStore } from '../../../auth/store/auth.store';
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
  private readonly userStore = inject(AuthStore);
  private readonly LOADING_DELAY = 400;
  timer = signal<boolean>(false);

  ImageUrl = ImageUrl.logo_nest_flow;

  constructor() {
    setTimeout(() => {
      this.timer.set(true);
    }, this.LOADING_DELAY);
  }

  logout(): void {
    this.userStore.logout();
  }

  sideLeftBarState = sideLeftBarState;
  sideRightbarState = signal(false);
  dropdownState: WritableSignal<boolean> = signal(false);

  readonly isMobile = signal(window.innerWidth < 1024);

  // Dropdown actif
  activeDropdown = signal<number | null>(null);

  // Gestion des menus dropdown
  dropdowns = [
    {
      label: 'Subscriptions',
      link: 'subscriptions',
      icon: 'subscriptions',
      subItems: [
        {
          label: 'List Subscriptions',
          link: 'subscriptions/list',
          icon: 'list',
        },
        { label: 'Add Subscription', link: 'subscriptions/add', icon: 'add' },
      ],
    },
    {
      label: 'Users',
      link: 'users',
      icon: 'person',
      subItems: [
        { label: 'List Users', link: 'users/list', icon: 'list' },
        { label: 'Add Users', link: 'users/add', icon: 'add' },
      ],
    },
  ];

  toggleDropdownState(index: number) {
    this.activeDropdown.update((prev) => (prev === index ? null : index));
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }

  readonly classes = computed(() => {
    return {
      menuIconClass: (route: string) =>
        this.isActive(route)
          ? 'menu-icon-solid text'
          : 'menu-icon-outline text-gray-500',

      textClassList: (route: string) =>
        this.isActive(route) ? 'text' : 'font-light text-gray-300',

      dropdownListClasses: (index: number) =>
        this.activeDropdown() === index
          ? 'active-lists text-white'
          : 'text-gray-400',

      dropdownIconClasses: (index: number) =>
        this.activeDropdown() === index ? 'text' : 'text-gray-500',

      dropdownTextClasses: (index: number) =>
        this.activeDropdown() === index
          ? 'text font-semibold'
          : 'text-gray-400 font-light',

      dropdownArrowClasses: (index: number) =>
        this.activeDropdown() === index
          ? 'rotate-90 text'
          : 'rotate-0 text-gray-300',
    };
  });

  // Classes dynamiques spécifiques pour Settings
  readonly dropdownClasses = computed(() => {
    const isOpened = this.sideRightbarState();
    return {
      listClasses: {
        'rounded-7': isOpened,
        'text-gray-400': !isOpened,
      },
      iconClasses: {
        text: isOpened,
        'text-gray-500': !isOpened,
      },
      textClasses: {
        text: isOpened,
        'text-gray-500/85 font-light': !isOpened,
      },
      arrowClasses: {
        '-rotate-90 text': isOpened,
        text: isOpened,
        'rotate-0 text-gray-300': !isOpened,
      },
    };
  });

  toggleDropdown() {
    this.sideRightbarState.set(!this.sideRightbarState());
  }
}
