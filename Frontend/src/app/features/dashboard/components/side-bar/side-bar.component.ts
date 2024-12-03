import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { sideLeftBarState } from '../../store/signal.store';

@Component({
  selector: 'app-side-bar',
  imports: [CommonModule, RouterLinkActive, RouterLink],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.scss',
})
export class SideBarComponent {
  private readonly router = inject(Router);

  sideLeftBarState = sideLeftBarState;
  
  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }

}


