import { Component, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, query, group } from '@angular/animations';

@Component({
  selector: 'app-menu-subscription',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('moveActiveBar', [
      transition('* => *', [
        query('.active-indicator', style({ transform: 'translateX({{ start }}px)' }), { optional: true }),
        group([
          query(
            '.active-indicator',
            animate('300ms ease', style({ transform: 'translateX({{ end }}px)' })),
            { optional: true }
          ),
        ]),
      ]),
    ]),
  ],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent {
  @Output() filterChange = new EventEmitter<string>();
  activeMenu = signal<number>(0);

  menuItems = [
    { label: 'Tous', icon: 'apps', filter: 'all' },
    { label: 'Actifs', icon: 'check_circle', filter: 'active' },
    { label: 'Inactifs', icon: 'cancel', filter: 'inactive' },
  ];

  // Récupère les positions de début et fin pour l'animation
  getTranslateX(index: number): { start: number; end: number } {
    const itemWidth = 100; // Largeur d'un élément en pixels
    const start = this.activeMenu() * itemWidth;
    const end = index * itemWidth;
    return { start, end };
  }

  setActiveMenu(index: number, filter: string) {
    this.activeMenu.set(index);
    this.filterChange.emit(filter);
  }
}