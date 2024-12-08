import { Component,  signal, computed, output, OutputEmitterRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, style, animate, transition, state } from '@angular/animations';

@Component({
  selector: 'app-menu-subscription',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu.component.html',
  animations: [
    trigger('activeTab', [
      state(
        'move',
        style({
          transform: 'translateX({{ x }}px)',
          width: '{{ width }}px',
        }),
        { params: { x: 0, width: 100 } }
      ),
      transition('* => *', [animate('0.5s ease-in-out')]),
    ]),
  ],
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent {
 filterChange: OutputEmitterRef<string> = output<string>();
 activeMenu = signal<number>(0);

  menuItems = [
    { label: 'Tous', icon: 'apps', filter: 'all' },
    { label: 'Actifs', icon: 'check_circle', filter: 'active' },
    { label: 'Inactifs', icon: 'cancel', filter: 'inactive' },
  ];


  tabDimensions = computed(() => {
    const tabs = document.querySelectorAll('ul[role="tablist"] li');
    if (tabs.length > 0) {
      const activeTab = tabs[this.activeMenu()]?.querySelector('a') as HTMLElement;
      if (activeTab) {
        return {
          width: activeTab.offsetWidth || 0,
          position: activeTab.offsetLeft || 0,
        };
      }
    }
    return { width: 0, position: 0 };
  });

  setActiveMenu(index: number, filter: string) {
    this.activeMenu.set(index);
    this.filterChange.emit(filter);
  }
}