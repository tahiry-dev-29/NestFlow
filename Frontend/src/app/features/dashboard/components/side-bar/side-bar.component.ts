import { Component, signal } from '@angular/core';
import { sidebarState } from '../../store/signal.store';

@Component({
  selector: 'app-side-bar',
  imports: [],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.scss'
})
export class SideBarComponent {
showFiller= signal(false);

toggleFiller(): void {
  this.showFiller.set(!this.showFiller());
}

sidebarState = sidebarState;
}
