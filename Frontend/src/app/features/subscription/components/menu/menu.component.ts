import { CommonModule } from '@angular/common';
import { Component, output, signal } from '@angular/core';
import { SearchBarComponent } from "../../../shared/components/search-bar/search-bar.component";

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
}