import { Component, inject, signal } from '@angular/core';
import { sidebarState } from '../../store/signal.store';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-side-bar',
  imports: [CommonModule, RouterLinkActive, RouterLink],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.scss',
})
export class SideBarComponent {
  showFiller = signal(false);

  private readonly router =inject(Router);

  toggleFiller(): void {
    this.showFiller.set(!this.showFiller());
  }

  sidebarState = sidebarState;

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }
  navigate(params: string[]){
    console.log("go dashboard");
    
    this.router.navigate(params);
  }
}


