import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, signal } from '@angular/core';
import { moveActiveBar } from '../../../shared/animations/animations';
import { SearchBarComponent } from "../../../shared/components/search-bar/search-bar.component";

@Component({
  selector: 'app-menu-subscription',
  standalone: true,
  imports: [CommonModule, SearchBarComponent],
  animations: [moveActiveBar],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent {
  @Output() filterChange = new EventEmitter<string>();
  activeMenu = signal<number>(0);

  menuItems = signal([
    { label: 'Tous', icon: 'apps', filter: 'all' },
    { label: 'Actifs', icon: 'check_circle', filter: 'active' },
    { label: 'Inactifs', icon: 'cancel', filter: 'inactive' },
  ]);

  getTranslateX(index: number): { start: number; end: number } {
    const itemWidth = 0;
    const start = this.activeMenu() * itemWidth;
    const end = index * itemWidth;
    return { start, end };
  }

  setActiveMenu(index: number, filter: string) {
    this.activeMenu.set(index);
    this.filterChange.emit(filter);
    console.log(`Filtre sélectionné : ${filter}`);
  }


}