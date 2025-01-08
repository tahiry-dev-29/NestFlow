import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageUrl } from '../../../../../../public/images/constant.images';
import { IUsers } from '../../models/users/users.module';

@Component({
    selector: 'app-view-user',
    standalone: true,
    imports: [CommonModule],
    template: `
    <main class="mt-0 transition-all duration-200 ease-in-out">
    <div class="flex flex-col items-center">
        <div class="px-3 mx-auto">
            <div
                class="relative z-0 flex flex-col min-w-0 break-words bg-slate-850/80 border-0 animate-shadow-pulse rounded-2xl">
                <div class="w-80 min-h-120  flex-auto p-6 mt-6">
                    @if (user()) {
                    <div class="relative w-full max-w-3xl mx-auto text-center">
                        <div class="bg-gradient-to-r from-blue-500 to-purple-600 h-48 rounded-t-lg transform hover:scale-105 transition-transform duration-300"></div>
                        <div class="relative -mt-28 px-6 animate-fadeIn">
                            <div class="relative inline-block mb-4">
                                <img [src]="user()?.imageUrl ? 'http://localhost:8080/api/images/upload/' + user()?.imageUrl : defaultImages"
                                                [alt]="user()?.firstName"
                                                (error)="handleImageError($event)"
                                   class="w-40 h-40 rounded-full border-4 border-white mx-auto shadow-lg hover:shadow-xl transition-shadow duration-300">
                                <span [ngClass]="{'bg-green-500': user()?.online , 'bg-red-500': user()?.online === false}"
                                      class="absolute bottom-2 right-2 w-4 h-4 rounded-full border-2 border-white animate-pulse"></span>
                            </div>
                            <h1 class="text-3xl font-bold text mb-2 animate-slideDown">{{ user()?.name }}</h1>
                            <p class="text-gray-300 mb-6 animate-slideUp">{{ user()?.mail }}</p>
                            <div class="mt-6 border-t border-gray-700 pt-4 animate-fadeIn">
                                <h2 class="text-xl font-semibold text-white mb-3">About</h2>
                                <p class="text-gray-300 max-w-lg mx-auto">User information and details go here.</p>
                            </div>
                        </div>
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
    user = input<IUsers | null | undefined>();

    readonly defaultImages = ImageUrl.defaultImages;
    handleImageError(event: any) {
        event.target.src = this.defaultImages;
    }
}