import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideBarComponent } from '../side-bar/side-bar.component';
import { HeaderComponent } from '../header/header.component';
import { SideBarRightComponent } from '../../../shared/components/side-bar-right/side-bar-right.component';
import { sidebarState, sideRightbarState } from '../../store/signal.store';

@Component({
  selector: 'app-dashboard-overview',
  imports: [
    RouterOutlet,
    SideBarComponent,
    HeaderComponent,
    SideBarRightComponent,
  ],
  templateUrl: './dashboard-overview.component.html',
  styleUrl: './dashboard-overview.component.scss',
})
export class DashboardOverviewComponent {
  sidebarState = sideRightbarState;
  loggle() {
    this.sidebarState.update((state) => !state);
  }
}
