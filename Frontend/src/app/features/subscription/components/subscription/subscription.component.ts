import { Component, signal } from '@angular/core';
import { DetailListsComponent } from "../detail-lists/detail-lists.component";
import { MenuComponent } from "../menu/menu.component";

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