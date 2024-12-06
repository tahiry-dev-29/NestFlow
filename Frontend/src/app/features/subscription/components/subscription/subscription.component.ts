import { Component } from '@angular/core';
import { DetailListsComponent } from "../../../users/components/detail-lists/detail-lists.component";
import { MenuComponent } from "../menu/menu.component";

@Component({
  selector: 'app-subscription',
  imports: [DetailListsComponent, MenuComponent],
  templateUrl: './subscription.component.html',
  styleUrl: './subscription.component.scss'
})
export class SubscriptionComponent {

}
