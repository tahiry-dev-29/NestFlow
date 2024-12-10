import { CommonModule } from '@angular/common';
import { Component, input, InputSignal, Signal, signal, WritableSignal } from '@angular/core';
import { expandCollapse } from '../../../shared/animations/animations';
import { ISubscription } from '../../models/subscription.interface';
import { FilterSubscribersPipe } from '../../../shared/pipe/filter-search.pipe';

@Component({
  selector: 'app-detail-lists',
  standalone: true,
  imports: [CommonModule, FilterSubscribersPipe],
  templateUrl: './detail-lists.component.html',
  styleUrls: ['./detail-lists.component.scss'],
  animations: [expandCollapse],
})
export class DetailListsComponent {
  // Signal pour le filtre
  filter: InputSignal<{ menu: string; search: string }> = input({
    menu: 'all',
    search: '',
  });

  // Signal pour l'abonné sélectionné
  expandedId = signal<number | null>(null);
  expandedMenuId = signal<number | null>(null);

  // Signal pour les abonnés
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

  // Calcul des classes pour la progression
  progressClasses(subscriber: ISubscription) {
    if (subscriber.progress === 100) return 'bg-green-500';
    if (subscriber.progress >= 75) return 'bg-blue-500';
    if (subscriber.progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  // Méthodes d'interaction
  toggleDetails(id: number) {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }

  toggleMenu(id: number) {
    this.expandedMenuId.set(this.expandedMenuId() === id ? null : id);
  }

  deleteSubscriber(id: number) {
    this.subscrib.set(this.subscrib().filter((abonne) => abonne.id !== id));
  }

  editSubscriber(id: number) {
    alert(`Modifier l'abonné avec ID : ${id}`);
  }
}