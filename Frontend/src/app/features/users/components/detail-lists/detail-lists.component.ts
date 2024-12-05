import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-detail-lists',
  imports: [CommonModule],
  templateUrl: './detail-lists.component.html',
  styleUrl: './detail-lists.component.scss'
})
export class DetailListsComponent {
  users = [
    {
      id: 1,
      fullname: 'Damilare Anjorin',
      email: 'damilareanjorin1@gmail.com',
      phone: '+2348106420637',
      status: 'active',
      createdAt: 'September 12',
    },
    // Ajoutez d'autres utilisateurs ici
  ];

  selectedUser: any = null;

  toggleDetails(user: any) {
    this.selectedUser = this.selectedUser === user ? null : user;
  }
}
