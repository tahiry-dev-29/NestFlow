import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-side-bar-right',
  standalone: true,
  imports: [],
  templateUrl: './side-bar-right.component.html',
  styleUrl: './side-bar-right.component.scss'
})
export class SideBarRightComponent {
  showFiller = signal(false);



}
