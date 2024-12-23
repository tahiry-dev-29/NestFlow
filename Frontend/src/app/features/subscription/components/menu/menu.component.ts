import { CommonModule } from '@angular/common';
import { Component, inject, output, signal } from '@angular/core';
import { SearchBarComponent } from "../../../shared/components/search-bar/search-bar.component";
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu-subscription',
  standalone: true,
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  imports: [SearchBarComponent, CommonModule],
})
export class MenuComponent {
  filterChange = output<string>();
  search = output<string>();
  activeMenu = signal<number>(0);

  private readonly router = inject(Router);

  menuItems = signal([
    { label: 'Tous', icon: 'apps', filter: 'all' },
    { label: 'Actifs', icon: 'check_circle', filter: 'active' },
    { label: 'Inactifs', icon: 'cancel', filter: 'inactive' },
  ]);

  setActiveMenu(index: number, filter: string) {
    this.activeMenu.set(index);
    this.filterChange.emit(filter);
  }
  
  onSearch(searchTerm: string) {
    this.search.emit(searchTerm);
  }

  onAddUser() {
    this.router.navigate(['dashboard','subscriptions', 'add']);
  }
}