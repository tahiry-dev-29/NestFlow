import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { fadeIn } from '../../../shared/animations/animations';
import { sideLeftBarState } from '../../store/signal.store';
import { HeaderComponent } from '../header/header.component';
import { SideBarComponent } from '../side-bar/side-bar.component';

@Component({
  selector: 'app-dashboard-overview',
  standalone: true,
  imports: [RouterOutlet, SideBarComponent, HeaderComponent, CommonModule],
  templateUrl: './dashboard-overview.component.html',
  styleUrls: ['./dashboard-overview.component.scss'],
  animations: [
    fadeIn
  ]
})
export class DashboardOverviewComponent{

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