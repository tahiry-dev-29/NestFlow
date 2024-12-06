import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideBarComponent } from '../side-bar/side-bar.component';
import { HeaderComponent } from '../header/header.component';
import { sideLeftBarState, sideRightbarState } from '../../store/signal.store';

@Component({
  selector: 'app-dashboard-overview',
  imports: [
    RouterOutlet,
    SideBarComponent,
    HeaderComponent
    ],
  templateUrl: './dashboard-overview.component.html',
  styleUrls: ['./dashboard-overview.component.scss'],
})
export class DashboardOverviewComponent {
  sideLeftBarState = sideLeftBarState;
  // sidebarState = sideRightbarState;
  isSmallScreen = false;

  constructor() {
    this.checkScreenSize(); 
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    this.isSmallScreen = window.innerWidth < 1200;
    if (this.isSmallScreen) {
      this.sideLeftBarState.update(() => false);
    }
  }

  // toggleRight() {
  //   this.sidebarState.update((state) => !state);
  // }
}
