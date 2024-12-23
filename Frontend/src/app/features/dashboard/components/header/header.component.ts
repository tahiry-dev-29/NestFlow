import { Component } from '@angular/core';
import { sideLeftBarState } from '../../store/signal.store';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  standalone: true,

})
export class HeaderComponent {
  sidebarState = sideLeftBarState;

  toggleSidebar(): void {
    this.sidebarState.update(state => !state);
  }


}
