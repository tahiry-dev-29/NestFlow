import { CommonModule } from '@angular/common';
import { Component, computed, CUSTOM_ELEMENTS_SCHEMA, HostListener, inject, Input, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { DirectiveModule } from "../../../../modules";
import { expandCollapse } from '../../../shared/animations/animations';
import { PopupsComponent } from "../../../shared/components/popups/popups.component";
import { RenewSubscriptionData, SubscriptionWithDetails } from '../../interfaces/subscription.interface';
import { SubscriptionDetails } from '../../models/subscription.model';
import { SubscriptionStore } from '../../store/store';
import { RenewSubscriptionFormComponent } from '../re-new-subscription/re-new-subscription-form.component';
import { ReNewSubscriptionComponent } from "../re-new-subscription/re-new-subscription.component";

@Component({
  selector: 'app-detail-lists',
  standalone: true,
  templateUrl: './detail-lists.component.html',
  styleUrls: ['./detail-lists.component.scss'],
  imports: [PopupsComponent, CommonModule, DirectiveModule, NgxPaginationModule, ReNewSubscriptionComponent, RenewSubscriptionFormComponent],
  animations: [expandCollapse],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DetailListsComponent implements OnInit {
  toastr = inject(ToastrService);
  router = inject(Router);

  store = inject(SubscriptionStore);

  // variables helpers
  @Input() filter: { menu: string; search: string } = { menu: 'all', search: '' };
  showPopup = signal(false);
  subscriberToDelete = signal<string | undefined>(undefined);
  maxSize: number = 5;
  itemsPerPage = signal<number>(10);
  currentPage = signal<number>(1);

  
  ngOnInit() {
    this.store.LoadSubscriptionWithDetails(this.store.subscriptionsWithDetails());
  }

  confirmDelete() {
    const id = this.subscriberToDelete();
    const fullname = this.store.subscriptionsWithDetails().find((subscription: SubscriptionWithDetails) => subscription.details.id === id)?.details.fullname ?? '';
    if (id !== null) {
      this.store.deleteSubscription({ id: id! });
      this.toastr.warning(`<span class="msg-class">${fullname}</span> deletion successful`);
    }
    this.closePopup();
    this.store.LoadSubscriptionWithDetails(this.store.subscriptionsWithDetails());
  }

  editSubscriber(id: string | undefined) {
    this.router.navigate(['dashboard/subscriptions/edit', id]);
  }

  trackById(subscription: SubscriptionDetails): string {
    return subscription.id ?? '';
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

  getProgressClass(progress: number) {
    const className: string =
      this.store.getProgressClasses()(progress);
    return className;
  }

  /* Pagination */
  setPage(page: number): void {
    const filteredCount = this.store.filteredSubscriptions()(this.filter.menu, this.filter.search).length;
    this.currentPage.set(filteredCount < 10 ? 1 : page);
  }

  /* Popup */
  openPopup(subscriberId: string | undefined) {
    this.subscriberToDelete.set(subscriberId);
    this.showPopup.set(true);
  }
  closePopup() {
    this.showPopup.set(false);
    this.subscriberToDelete.set(undefined);
  }


  // renew
  showRenewPopup = signal(false);
  subscriberToRenew = signal<SubscriptionDetails | undefined>(undefined);

  closeRenewPopup(): void {
    this.showRenewPopup.set(false);
  }

  handleRenewSubmit(data: RenewSubscriptionData): void {
    console.log('Renewal data:', data);
    // Implémentez ici la logique de renouvellement
    this.closeRenewPopup();
  }

  renewSubscription(id: string): void {
    this.subscriberToRenew.set(this.store.subscriptionsWithDetails().find((subscription: SubscriptionWithDetails) => subscription.details.id === id)?.details);
    this.showRenewPopup.set(true);
  }
  

}
