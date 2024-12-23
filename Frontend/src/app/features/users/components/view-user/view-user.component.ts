import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IUsers } from '../../store/users.store';

@Component({
  selector: 'app-view-user',
  standalone: true,
  imports: [CommonModule],
  template: `
    <main class="mt-0 transition-all duration-200 ease-in-out">
      <div class="flex flex-col items-center">
        <div class="w-full max-w-md px-3 mx-auto">
          <div class="relative z-0 flex flex-col min-w-0 break-words bg-slate-850/80 border-0 animate-shadow-pulse rounded-2xl">
            <div class="flex-auto p-6 mt-6 flex flex-wrap">
              @if (user) {
                <div class="relative w-full px-4 max-w-full flex-grow flex-1">
                  <h5 class="text-gray-400 uppercase font-bold text-xs mt-1 mb-0">{{ user.fullname }}</h5>
                  <span class="text-sm leading-normal mt-0 mb-2 text-gray-400">{{ user.email }}</span>
                  <img [src]="user.image" [alt]="user.fullname" class="w-20 h-20 rounded-full mt-2 mb-2">
                  <span class="text-sm leading-normal mt-0 mb-2 text-gray-400">Status: {{ user.status }}</span>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </main>
  `,
  styleUrl: './view-user.component.scss'
})
export class ViewUserComponent {
  @Input() user: IUsers | null = null;
}