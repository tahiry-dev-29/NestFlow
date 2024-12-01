import { Component, signal } from '@angular/core';
import { sideRightbarState } from '../../../dashboard/store/signal.store';

@Component({
  selector: 'app-side-bar-right',
  imports: [],
  templateUrl: './side-bar-right.component.html',
  styleUrl: './side-bar-right.component.scss'
})
export class SideBarRightComponent {
  showFiller = signal(false);

  loggle(): void {
    this.showFiller.set(!this.showFiller());
  }

  sidebarState = sideRightbarState;


}
