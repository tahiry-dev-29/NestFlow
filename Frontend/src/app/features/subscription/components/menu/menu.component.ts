import { CommonModule } from '@angular/common';
import { Component, inject, output, signal } from '@angular/core';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar.component';
import { Router } from '@angular/router';
import { SubscriptionStore } from '../../store/store';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-menu-subscription',
  standalone: true,
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  imports: [SearchBarComponent, CommonModule],
})
export class MenuComponent {
  filterChange = output<string>();
  search = output<string>();
  activeMenu = signal<number>(0);

  private readonly router = inject(Router);
  readonly store = inject(SubscriptionStore);
  private readonly toasters = inject(ToastrService);
  refreshData() {
    this.store.LoadSubscriptionWithDetails(
      this.store.subscriptionsWithDetails()
    ),
      this.toasters.success(
        `<span class="font-semibold">Data is already updated...</span>`
      );
  }

  menuItems = signal([
    { label: 'All', icon: 'apps', filter: 'all' },
    { label: 'Actives', icon: 'check_circle', filter: 'active' },
    { label: 'Expired', icon: 'cancel', filter: 'inactive' },
  ]);

  setActiveMenu(index: number, filter: string) {
    this.activeMenu.set(index);
    this.filterChange.emit(filter);
  }

  onSearch(searchTerm: string) {
    this.search.emit(searchTerm);
  }

  onAddUser() {
    this.router.navigate(['dashboard', 'subscriptions', 'add']);
  }
}
