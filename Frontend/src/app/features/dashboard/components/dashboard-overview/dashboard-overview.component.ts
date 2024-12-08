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
})
export class DashboardOverviewComponent {
  sideLeftBarState = sideLeftBarState; // On garde le signal
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
      // Si l'écran est petit, on cache la sidebar
      this.sideLeftBarState.update(() => false);
    }
  }

  toggleSidebar() {
    // Inverse l'état de la sidebar
    this.sideLeftBarState.update((state) => !state);
  }
}