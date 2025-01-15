import { Component } from '@angular/core';
import { sideLeftBarState } from '../../store/signal.store';

@Component({
  selector: 'app-header',
  imports: [],
  template: `
    <nav class="flex flex-wrap items-center gap-3 justify-between text-white">
      <button (click)="toggleSidebar()" class="text-white flex items-center group">
        <span class="material-icons text-3xl transition-transform duration-100 ease-in-out group-hover:text group-hover:scale-90 w-10 group-hover:transform-cpu">
          menu
        </span>
      </button>
      @let title = "NEST FLOW";
      <span class="font-bold text-3xl text-uppercase text">{{ title }}</span>
      <section class="flex items-center gap-3">
        <button class="text-white flex items-center group">
          <span class="material-icons text-3xl transition-transform duration-100 ease-in-out group-hover:text group-hover:scale-90 w-10 group-hover:transform-cpu">
            notifications
          </span>
        </button>
      </section>
    </nav>

  `,
  styleUrl: './header.component.scss',
  standalone: true,

})
export class HeaderComponent {
  sidebarState = sideLeftBarState;

  toggleSidebar(): void {
    this.sidebarState.update(state => !state);
  }
}
