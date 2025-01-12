import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageUrl } from '../../../../../../public/images/constant.images';
import { IUsers, UserEntity } from '../../models/users/users.module';

@Component({
    selector: 'app-view-user',
    standalone: true,
    imports: [CommonModule],
    template: `
    <main class="mt-0 transition-all duration-200 ease-in-out">
        <section class="flex flex-col items-center">
            <article class="px-3 mx-auto">
                <div class="relative z-0 flex flex-col min-w-0 break-words bg-slate-850/80 border-0 shadow-lg rounded-2xl">
                    <div class="w-80 min-h-120 flex-auto p-6">
                        @if (user()) {
                        <section class="relative w-full max-w-3xl mx-auto text-center">
                            <!-- Banner avec animation au survol -->
                            <header class="bg-gradient-to-r from-blue-500 to-purple-600 h-48 rounded-t-lg transition-all duration-300 hover:from-purple-600 hover:to-blue-500"></header>
                            
                            <!-- Profile Section -->
                            <section class="relative -mt-28 px-6">
                                <!-- Profile Picture avec animation -->
                                <figure class="relative inline-block mb-4 transform transition-transform duration-300 hover:scale-105">
                                    <img [src]="getImageSrc()"
                                         [alt]="user()?.firstName"
                                         (error)="handleImageError($event)"
                                         class="w-40 h-40 rounded-full border-4 border-white mx-auto shadow-lg object-cover transition-all duration-300 hover:border-blue-500">
                                    <span [ngClass]="{'bg-green-500': user()?.online, 'bg-red-500': !user()?.online}"
                                          class="absolute bottom-2 right-2 w-4 h-4 rounded-full border-2 border-white animate-pulse"></span>
                                </figure>

                                <!-- User Info avec animations -->
                                <section class="space-y-3 transform transition-all duration-300">
                                    <h1 class="text-2xl font-bold hover:text-blue-400 transition-colors duration-300 text">
                                        {{ user()?.name }} {{ user()?.firstName }}
                                    </h1>
                                    <p class="text-gray-300 hover:text-white transition-colors duration-300">{{ user()?.mail }}</p>
                                    <span class="inline-block px-4 py-1.5 text-sm font-semibold rounded-full cursor-pointer transform transition-all duration-300 hover:scale-105"
                                          [ngClass]="roleClasses()">
                                        {{ user()?.role }}
                                    </span>
                                </section>

                                <!-- Additional Info avec effets -->
                                <section class="mt-8 grid grid-cols-1 gap-6">
                                    <section class="border-t border-gray-700 pt-6 transition-all duration-300 hover:border-blue-500">
                                        <h2 class="text-xl font-semibold text-white mb-3 hover:text-blue-400 transition-colors duration-300">Contact</h2>
                                        <p class="text-gray-300 flex items-center justify-center gap-2 group">
                                            <span class="font-semibold group-hover:text-blue-400 transition-colors duration-300">Email:</span>
                                            <span class="group-hover:text-white transition-colors duration-300">{{ user()?.mail }}</span>
                                        </p>
                                    </section>
                                </section>
                            </section>
                        </section>
                        }
                    </div>
                    </div>
            </article>
        </section>
    </main>
  `,
    styleUrl: './view-user.component.scss'
})
export class ViewUserComponent {
    user = input<IUsers | null | undefined>();
    isPreview = input<boolean>(false);

    readonly defaultImages = ImageUrl.defaultImages;
    protected readonly UserEntity = UserEntity;

    readonly roleClasses = computed(() => {
        const role = this.user()?.role;
        const classes = {
            'ADMIN': 'bg-blue-500/10 text-blue-500',
            'USER': 'bg-green-500/10 text-green-500',
        };
        return classes[role as unknown as keyof typeof classes] || 'bg-gray-500/10 text-gray-500';
    });

    getImageSrc(): string {
        const imageUrl = this.user()?.imageUrl;
        if (!imageUrl) return this.defaultImages;

        if (imageUrl.startsWith('data:') || imageUrl.startsWith('../')) {
            return imageUrl;
        }

        return `http://localhost:8080/api/images/upload/${imageUrl}`;
    }

    handleImageError(event: any) {
        event.target.src = this.defaultImages;
    }
}