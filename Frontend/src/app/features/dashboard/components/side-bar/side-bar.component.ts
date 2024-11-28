import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { sidebarState } from '../../store/signal.store';

@Component({
  selector: 'app-side-bar',
  imports: [MatSidenavModule, MatButtonModule],
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
