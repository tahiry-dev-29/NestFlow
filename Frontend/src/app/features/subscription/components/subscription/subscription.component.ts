import { Component, computed, signal, WritableSignal } from '@angular/core';
import { MenuComponent } from './../menu/menu.component';
import { DetailListsComponent } from './../detail-lists/detail-lists.component';

@Component({
  selector: 'app-subscription',
  standalone: true,
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.scss'],
  imports: [MenuComponent, DetailListsComponent],
})
export class SubscriptionComponent {
  filter: WritableSignal<string> = signal('all');
  searchTerm: WritableSignal<string> = signal('');

  combinedFilter = computed(() => ({
    menu: this.filter(),
    search: this.searchTerm(),
  }));

  onFilterChange(filter: string) {
    this.filter.set(filter);
  }

  onSearchChange(searchTerm: string) {
    this.searchTerm.set(searchTerm);
  }
}