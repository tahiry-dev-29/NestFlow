import { CommonModule } from '@angular/common';
import { Component, signal, computed, input, InputSignal } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-detail-lists',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detail-lists.component.html',
  styleUrls: ['./detail-lists.component.scss'],
  animations: [
    trigger('expandCollapse', [
      transition(':enter', [
        style({ transform: 'translateY(-40px)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('500ms ease-in', style({ opacity: 0, transform: 'translateY(-20px)' }))
      ])
    ])
  ]
})
export class DetailListsComponent {

  filter: InputSignal<string> = input<string>('all'); // Reçoit le filtre depuis le parent

  subscrib = signal([
    { id: 1, fullname: 'Jean Dupont', email: 'jean.dupont@example.com', tel: '0612345678', adresse: '123 Rue des Lilas', createdAt: '2024-01-01', progress: 75, active: true },
    { id: 2, fullname: 'Marie Curie', email: 'marie.curie@example.com', tel: '0623456789', adresse: '456 Avenue des Fleurs', createdAt: '2024-01-02', progress: 50, active: false },
  ]);


  expandedId = signal<number | null>(null);
  expandedMenuId = signal<number | null>(null);

  filteredSubscrib = computed(() => {
    const filterValue = this.filter();
    return this.subscrib().filter((sub) => {
      if (filterValue === 'all') return true;
      if (filterValue === 'active') return sub.active;
      if (filterValue === 'inactive') return !sub.active;
      return true;
    });
  });

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

