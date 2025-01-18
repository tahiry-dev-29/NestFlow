import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideBarComponent } from '../side-bar/side-bar.component';
import { HeaderComponent } from '../header/header.component';
import { sideLeftBarState } from '../../store/signal.store';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-overview',
  imports: [RouterOutlet, SideBarComponent, HeaderComponent, CommonModule],
  templateUrl: './dashboard-overview.component.html',
  styleUrls: ['./dashboard-overview.component.scss'],
  standalone: true,
})
export class DashboardOverviewComponent {
  sideLeftBarState = sideLeftBarState;
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

  toggleSidebar() {
    this.sideLeftBarState.update((state) => !state);
  }
}