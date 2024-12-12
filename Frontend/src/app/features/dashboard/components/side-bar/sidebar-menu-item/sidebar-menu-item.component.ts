import { CommonModule } from '@angular/common';
import { Component, Input, WritableSignal, signal, computed } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MenuItem } from './menu-item.interface';

@Component({
  selector: 'app-sidebar-menu-item',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './sidebar-menu-item.component.html',
  styleUrls: ['./sidebar-menu-item.component.scss']
})
export class SidebarMenuItemComponent {
  @Input() menuItem!: MenuItem; // L'élément de menu passé en entrée
  dropdownState: WritableSignal<boolean> = signal(false); // Etat du dropdown

  // Méthode pour vérifier si l'élément de menu est actif
  readonly isActive = computed(() => {
    return this.router.url.includes(this.menuItem.route);
  });

  // Méthode pour basculer l'état du dropdown
  toggleDropdown() {
    this.dropdownState.update((prevState) => !prevState);
  }

  constructor(private router: Router) {}
}