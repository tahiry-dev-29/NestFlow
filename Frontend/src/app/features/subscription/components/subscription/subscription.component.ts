import { MenuComponent } from './../menu/menu.component';
import { DetailListsComponent } from './../detail-lists/detail-lists.component';
import { Component, signal } from '@angular/core';


@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [DetailListsComponent, MenuComponent],
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.scss']
})
export class SubscriptionComponent {
  filter = signal<string>('all');
  
  onFilterChange(newFilter: string) {
    this.filter.set(newFilter);
  }
}