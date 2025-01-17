import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, HostListener, inject, Input, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PopupsComponent } from "../../../shared/components/popups/popups.component";

import { DirectiveModule } from "../../../../modules";
import { expandCollapse } from '../../../shared/animations/animations';
import { ISubscription } from '../../models/subscription.interface';
import { SubscriptionStore } from '../../store/store';
import { SubscriptionDetails } from '../../models/subscription.model';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-detail-lists',
  standalone: true,
  templateUrl: './detail-lists.component.html',
  styleUrls: ['./detail-lists.component.scss'],
  imports: [PopupsComponent, CommonModule, DirectiveModule, NgxPaginationModule],
  animations: [expandCollapse],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DetailListsComponent implements OnInit {
  // injects
  store = inject(SubscriptionStore);
  toastr = inject(ToastrService);
  router = inject(Router);

  // variables helpers
  @Input() filter: { menu: string; search: string } = { menu: 'all', search: '' };
  showPopup = signal(false);
  subscriberToDelete = signal<string | undefined>(undefined);
  currentPage = signal<number>(1);

  // ngOnInit
  ngOnInit() { 
      this.store.loadSubscriptions(this.store.subscriptions());
  }

  // confirmDelete
  confirmDelete() {
    const id = this.subscriberToDelete();
    const fullname = this.store.subscriptions().find((subscription: SubscriptionDetails) => subscription.id === id)?.fullname ?? '';
    if (id !== null) {
      this.store.deleteSubscription({ id: id! });
      this.toastr.warning(`<span class="msg-class">${fullname}</span> deletion successful`);
    }
    this.closePopup();
  }
  // edit Subscriber
  editSubscriber(id: string | undefined) {
    this.router.navigate(['dashboard/subscriptions/edit', id]);
  }
  // track By Id
  trackById(subscription: ISubscription): number {
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

  getProgressClass(progress: number) {
    const className: string =
      this.store.getProgressClasses()(progress);
    return className;
  }
  
  setPage(page: number): void {
    this.currentPage.set(page);
  }

  openPopup(subscriberId: string | undefined) {
    this.subscriberToDelete.set(subscriberId);
    this.showPopup.set(true);
  }
  // closePopup
  closePopup() {
    this.showPopup.set(false);
    this.subscriberToDelete.set(undefined);
  }

}
