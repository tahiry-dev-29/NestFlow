import { Component } from '@angular/core';
import { sideLeftBarState } from '../../store/signal.store';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  sidebarState = sideLeftBarState;

  toggleSidebar(): void {
    this.sidebarState.update(state => !state);
  }
}
