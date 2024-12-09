import { CommonModule } from '@angular/common';
import { Component, computed, input, InputSignal, Signal, signal, WritableSignal } from '@angular/core';
import { expandCollapse } from '../../../shared/animations/animations';
import { ISubscription } from '../../models/subscription.interface';

@Component({
  selector: 'app-detail-lists',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detail-lists.component.html',
  styleUrls: ['./detail-lists.component.scss'],
  animations: [expandCollapse]
})
export class DetailListsComponent {
  filter: InputSignal<string> = input<string>('all');

  expandedId = signal<number | null>(null);
  expandedMenuId = signal<number | null>(null);
  searchTerm = signal<string>(''); // Gère le terme de recherche localement
  
  subscrib: WritableSignal<ISubscription[]> = signal([
    {
      id: 1,
      fullname: 'Jean Dupont',
      email: 'jean.dupont@example.com',
      tel: '0612345678',
      adresse: '123 Rue des Lilas',
      createdAt: '2024-01-01',
      progress: 75,
      active: true,
    },
    {
      id: 2,
      fullname: 'Marie Curie',
      email: 'marie.curie@example.com',
      tel: '0623456789',
      adresse: '456 Avenue des Fleurs',
      createdAt: '2024-01-02',
      progress: 50,
      active: false,
    },
    {
      id: 3,
      fullname: 'YCurie',
      email: 'ymarie.curie@example.com',
      tel: '0623456789',
      adresse: '42756 Avenue des Fleurs',
      createdAt: '2024-01-02',
      progress: 5,
      active: true,
    },
    {
      id: 4,
      fullname: 'rCurie',
      email: 'rcurie@example.com',
      tel: '0623456789',
      adresse: '5857 tt Fleurs',
      createdAt: '2024-01-02',
      progress: 78,
      active: false,
    },
    {
      id: 5,
      fullname: 'oCurie',
      email: 'ddcurie@example.com',
      tel: '0623456789',
      adresse: '7857 Avenue des Fleurs',
      createdAt: '2024-01-02',
      progress: 100,
      active: true,
    },
    {
      id: 6,
      fullname: 'Marie',
      email: 'vhcurie@example.com',
      tel: '0623456789',
      adresse: '41858 Avenue des Fleurs',
      createdAt: '2024-01-02',
      progress: 90,
      active: false,
    },
  ]);

  // Recalcule des classes pour la progression basée sur la liste filtrée
  progressClasses = computed(() =>
    this.filteredSubscrib().map((abonne) => {
      if (abonne.progress === 100) return 'bg-green-500';
      if (abonne.progress >= 75) return 'bg-blue-500';
      if (abonne.progress >= 50) return 'bg-yellow-500';
      return 'bg-red-500';
    })
  );

  filteredSubscrib: Signal<ISubscription[]>  = computed(() => {
    const filterValue = this.filter();
    const filtered = this.subscrib().filter((sub) => {
      if (filterValue === 'all') return true;
      if (filterValue === 'active') return sub.active;
      if (filterValue === 'inactive') return !sub.active;
      return (
        sub.fullname.toLowerCase().includes(filterValue.toLowerCase()) ||
        sub.email.toLowerCase().includes(filterValue.toLowerCase())
      );
    });
    return filtered;
  });

  setSearchTerm(term: string) {
    this.searchTerm.set(term);
  }

  toggleDetails(id: number) {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }

  toggleMenu(id: number) {
    this.expandedMenuId.set(this.expandedMenuId() === id ? null : id);
  }

  deleteSubscriber(id: number) {
    const updatedList = this.subscrib().filter((abonne) => abonne.id !== id);
    this.subscrib.set(updatedList);
  }

  editSubscriber(id: number) {
    alert(`Modifier l'abonné avec ID : ${id}`);
  }
}
