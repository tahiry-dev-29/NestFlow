import { CommonModule } from '@angular/common';
import { Component, inject, HostListener } from '@angular/core';
import { UserStore } from '../../store/users.store';
import { Router } from '@angular/router';
import { AddUserComponent } from "../add-user/add-user.component";
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, AddUserComponent],
  template: `
    <main class="relative overflow-hidden">
      <div class="flex flex-wrap -mx-3">
        <div class="flex-none w-full max-w-full px-3">
          <div class="relative flex flex-col min-w-0 mb-6 p-2 break-words border-0 border-transparent border-solid bg-slate-850 shadow-dark-xl rounded-2xl bg-clip-border">
            <div class="flex justify-between items-center p-6 pb-0 mb-0 border-b-0 border-b-solid rounded-t-2xl border-b-transparent">
              <h6 class="text-white text-xl font-semibold">Users Table</h6>
              <button class="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1" (click)="toggleAddUserSidebar()">
                <span class="flex items-center">
                  <i class="material-icons mr-2">add</i>
                  Add User
                </span>
              </button>
            </div>
            <div class="flex-auto px-0 pt-0 pb-2">
              <div class="p-0 overflow-x-auto">
                <table class="items-center w-full mb-0 align-top border-collapse border-white/40 text-slate-500">
                  <thead class="align-bottom">
                    <tr>
                      <th class="px-6 py-3 font-bold text-left uppercase align-middle bg-transparent border-b border-collapse shadow-none border-white/40 text-white text-xxs border-b-solid tracking-none whitespace-nowrap opacity-70">User</th>
                      <th class="px-6 py-3 pl-2 font-bold text-left uppercase align-middle bg-transparent border-b border-collapse shadow-none border-white/40 text-white text-xxs border-b-solid tracking-none whitespace-nowrap opacity-70">Email</th>
                      <th class="px-6 py-3 font-bold text-center uppercase align-middle bg-transparent border-b border-collapse shadow-none border-white/40 text-white text-xxs border-b-solid tracking-none whitespace-nowrap opacity-70">Status</th>
                      <th class="px-6 py-3 font-semibold capitalize align-middle bg-transparent border-b border-collapse border-solid shadow-none border-white/40 text-white tracking-none whitespace-nowrap opacity-70">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let user of store.users()">
                      <td class="p-2 align-middle bg-transparent border-b border-white/40 whitespace-nowrap shadow-transparent">
                        <div class="flex px-2 py-1">
                          <div>
                            <img [src]="user.image" class="inline-flex items-center justify-center mr-4 text-sm text-white transition-all duration-200 ease-in-out h-9 w-9 rounded-xl" [alt]="user.fullname" />
                          </div>
                          <div class="flex flex-col justify-center">
                            <h6 class="mb-0 text-sm leading-normal text-white">{{ user.fullname }}</h6>
                          </div>
                        </div>
                      </td>
                      <td class="p-2 align-middle bg-transparent border-b border-white/40 whitespace-nowrap shadow-transparent">
                        <p class="mb-0 text-xs leading-tight text-white opacity-80">{{ user.email }}</p>
                      </td>
                      <td class="p-2 text-sm leading-normal text-center align-middle bg-transparent border-b border-white/40 whitespace-nowrap shadow-transparent">
                        <span [ngClass]="store.userStatusClass()(user.status)" class="px-2.5 text-xs rounded-1.8 py-1.4 inline-block whitespace-nowrap text-center align-baseline font-bold uppercase leading-none text-white">{{ user.status }}</span>
                      </td>
                      <td class="p-2 align-middle bg-transparent border-b border-white/40 whitespace-nowrap shadow-transparent">
                        <a href="javascript:;" class="text-xs font-semibold leading-tight text-white opacity-80">Edit</a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div *ngIf="showAddUserSidebar" class="fixed inset-0 bg-black bg-opacity-50 z-980" (click)="closeSidebar()"></div>
      <div *ngIf="showAddUserSidebar" [@slideInOut] class="fixed top-0 right-0 z-990 h-full w-85 bg-slate-900 shadow-lg flex flex-col">
        <div class="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 class="title animate-pulse">Add User</h2>
          <button (click)="closeSidebar()" class="text-white hover:text-gray-300">
            <i class="material-icons">close</i>
          </button>
        </div>
        <div class="flex-grow overflow-y-auto p-4">
          <app-add-user></app-add-user>
        </div>
      </div>
    </main>
  `,
  styleUrl: './table.component.scss',
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateX(100%)' }),
        animate('300ms ease-in', style({ transform: 'translateX(0%)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(100%)' }))
      ])
    ])
  ]
})
export class TableComponent {
  store = inject(UserStore);
  showAddUserSidebar = false;

  toggleAddUserSidebar() {
    this.showAddUserSidebar = !this.showAddUserSidebar;
  }

  closeSidebar() {
    this.showAddUserSidebar = false;
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: KeyboardEvent) {
    if (this.showAddUserSidebar) {
      this.closeSidebar();
    }
  }
}
