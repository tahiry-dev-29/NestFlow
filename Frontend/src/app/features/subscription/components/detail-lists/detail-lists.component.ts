import { CommonModule } from '@angular/common';
import { Component, inject, input, InputSignal, signal } from '@angular/core';
import { ToastrModule, ToastrService } from "ngx-toastr";
import { expandCollapse } from '../../../shared/animations/animations';
import { PopupsComponent } from "../../../shared/components/popups/popups.component";
import { SubscriptionStore } from '../../store/subscribed.store';
import { Router } from '@angular/router';
import { ISubscription } from '../../models/subscription.interface';

@Component({
  selector: 'app-detail-lists',
  standalone: true,
  imports: [CommonModule, PopupsComponent, ToastrModule],
  templateUrl: './detail-lists.component.html',
  styleUrl: './detail-lists.component.scss',
  animations: [expandCollapse],
})
export class DetailListsComponent {
  store = inject(SubscriptionStore);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  filter: InputSignal<{ menu: string; search: string }> = input({
    menu: 'all',
    search: '',
  });

  showPopup = signal(false);
  subscriberToDelete = signal<number | null>(null);
  showAddForm = signal(false);

  getRemainingDays(abonneId: number) {
    const subscription = this.store.getSubscriptionById(abonneId);
    if (!subscription) return 0; // Handle null case
    return this.calculateRemainingDays(subscription);
  }

  private calculateRemainingDays(subscription: ISubscription): number {
    const endDate = new Date(subscription.subscriptionEndDate);
    const today = new Date();
    const differenceInTime = endDate.getTime() - today.getTime();
    return Math.ceil(differenceInTime / (1000 * 3600 * 24));
  }

  toggleAddForm() {
    this.showAddForm.update(value => !value);
  }

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
    const fullname = this.store.getSubscriptionById(id!)?.fullname ?? '';
    if (id !== null) {
      this.store.deleteSubscription(id);
      this.toastr.success(
        `L'abonnement de <span class="msg-class">${fullname}</span> est supprimé avec succès`
      );
    }
    this.closePopup();
  }

  editSubscriber(id: number) {
    this.router.navigate(['dashboard/subscriptions/edit', id]);
  }

  trackById(index: number, item: any): number {
    return item.id;
  }
}