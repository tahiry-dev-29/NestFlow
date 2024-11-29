import { Component } from '@angular/core';
import { sidebarState } from '../../store/signal.store';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  sidebarState = sidebarState;

  toggleSidebar(): void {
    this.sidebarState.update(state => !state);
  }

}
