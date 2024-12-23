import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { interval, Subscription } from 'rxjs'; // Importez Subscription
import { PopupsComponent } from "../../../shared/components/popups/popups.component";

import { DirectiveModule } from "../../../../modules";
import { expandCollapse } from '../../../shared/animations/animations';
import { SubscriptionStore } from '../../store/subscribed.store';
import { ISubscription } from '../../models/subscription.interface';

@Component({
  selector: 'app-detail-lists',
  standalone: true,
  templateUrl: './detail-lists.component.html', // Lien vers le template HTML
  styleUrls: ['./detail-lists.component.scss'],
  imports: [PopupsComponent, CommonModule, DirectiveModule, ScrollingModule, CdkVirtualScrollViewport],
  animations: [expandCollapse],
})
export class DetailListsComponent implements OnInit, OnDestroy {
  store = inject(SubscriptionStore);
  private toastr = inject(ToastrService);
  private router = inject(Router);
  private intervalSubscription: Subscription | undefined;

  @Input() filter: { menu: string; search: string } = { menu: 'all', search: '' }; // Input pour le filtrage
  showPopup = signal(false);
  subscriberToDelete = signal<number | null>(null);

  ngOnInit() {
    this.store.loadSubscriptions();

    this.intervalSubscription = interval(1000).subscribe(() => {
      this.store.subscriptionProgress();
    })
  }

  ngOnDestroy(): void {
    this.intervalSubscription?.unsubscribe();
  }


  getRemainingDays(id: number): number {
    const subscription = this.store.getSubscriptionById(id);
    if (!subscription) return 0;
    const endDate = new Date(subscription.subscriptionEndDate);
    const today = new Date();
    const differenceInTime = endDate.getTime() - today.getTime();
    return Math.max(0, Math.ceil(differenceInTime / (1000 * 3600 * 24)));
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
      this.toastr.success(`L'abonnement de <span class="msg-class">${fullname}</span> est supprimé avec succès`);
    }
    this.closePopup();
  }

  editSubscriber(id: number) {
    this.router.navigate(['dashboard/subscriptions/edit', id]);
  }

  trackById(index: number, subscription: ISubscription): number {
    return subscription.id;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.store.expandedMenuId() !== null) {
      const clickedElement = event.target as HTMLElement;
      if (!clickedElement.closest('.tooltip-container') && !clickedElement.closest('button')) {
        this.store.closeExpandedMenu();
      }
    }
  }
}