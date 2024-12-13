import { CommonModule } from '@angular/common';
import { Component, inject, input, InputSignal, signal } from '@angular/core';
import { expandCollapse } from '../../../shared/animations/animations';
import { PopupsComponent } from "../../../shared/components/popups/popups.component";
import { FilterSubscribersPipe } from '../../../shared/pipe/filter-search.pipe';
import { ToastrModule, ToastrService } from "ngx-toastr";
import { SubscriptionStore } from '../../store/subscribed.store';
import { AddSubscriptionComponent } from '../add-subscription/add-subscription.component';

@Component({
  selector: 'app-detail-lists',
  standalone: true,
  imports: [CommonModule, FilterSubscribersPipe, PopupsComponent, ToastrModule, AddSubscriptionComponent],
  templateUrl: './detail-lists.component.html',
  styleUrls: ['./detail-lists.component.scss'],
  animations: [expandCollapse],
})
export class DetailListsComponent {
  private store = inject(SubscriptionStore);
  private toastr = inject(ToastrService);

  // Input signal for filter
  filter: InputSignal<{ menu: string; search: string }> = input({
    menu: 'all',
    search: '',
  });

  // Store signals
  subscrib = this.store.subscriptions;
  expandedId = this.store.expandedId;
  expandedMenuId = this.store.expandedMenuId;
  showPopup = signal(false);
  subscriberToDelete = signal<number | null>(null);
  showAddForm = signal(false);

  // Progress classes helper
  getProgressClasses(progress: number): string {
    if (progress === 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  // Helper method to get remaining days
  getRemainingDays(abonneId: number) {
    return this.store.subscriptionDetails()?.find(s => s.id === abonneId)?.remainingDays || 0;
  }

  // Helper method to get remaining progress
  getRemainingProgress(id: number): number {
    return this.store.subscriptionDetails()?.find(s => s.id === id)?.progress || 0;
  }

  // Interaction methods
  toggleDetails(id: number) {
    this.store.toggleDetails(id);
  }

  toggleMenu(id: number) {
    this.store.toggleMenu(id);
  }

  toggleAddForm() {
    this.showAddForm.update(value => !value);
  }

  // Popup methods
  openPopup(subscriberId: number) {
    this.subscriberToDelete.set(subscriberId);
    this.showPopup.set(true);
  }

  closePopup() {
    this.showPopup.set(false);
    this.subscriberToDelete.set(null);
  }

  confirmDelete() {
    const id = this.subscriberToDelete();
    const fullname = this.subscrib().find(abonne => abonne.id === id)?.fullname ?? '';
    if (id !== null) {
      this.store.deleteSubscription(id);
      this.toastr.success(
        `L'abonnement de <span class="msg-class">${id} ${fullname}</span> supprimé avec succès`
      );
    }
    this.closePopup();
  }

  editSubscriber(id: number) {
    alert(`Modifier l'abonné avec ID : ${id}`);
  }
}