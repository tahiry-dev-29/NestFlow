import { Component, signal, WritableSignal } from '@angular/core';
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
  filter: WritableSignal<string> = signal<string>('all');

  onSearch(searchTerm: string) {
    this.filter.set(searchTerm);
  }
}

