import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageUrl } from '../../../../../../public/images/constant.images';
import { IUsers } from '../../models/users/users.module';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-view-user',
  standalone: true,
  imports: [CommonModule],
  template: `
    <main class="mt-0 transition-all duration-200 ease-in-out z-990">
      <section class="flex flex-col items-center">
        <article class="px-3 mx-auto">
          <div
            class="relative z-0 flex flex-col min-w-0 break-words bg-slate-850 border-0 shadow-lg rounded-2xl"
          >
            <div class="w-80 min-h-120 flex-auto p-6">
              @if (user()) {
              <section class="relative w-full max-w-3xl mx-auto text-center">
                <header
                  class="bg-gradient-to-r from-blue-500/80 to-purple-600/80 h-48 rounded-t-lg transition-all duration-300 hover:from-purple-600/50 hover:to-blue-500/50"
                ></header>

                <section class="relative -mt-28 px-6">
                  <figure
                    class="relative inline-block mb-4 transform transition-transform duration-150 hover:scale-105"
                  >
                    <img
                      [src]="getImageSrc()"
                      [alt]="user()?.firstName"
                      (error)="handleImageError($event)"
                      class="w-40 h-40 rounded-full border-4 border-white mx-auto shadow-lg object-cover transition-all duration-150 hover:border-blue-500"
                    />
                    <span
                      [ngClass]="{
                        'bg-green-500': user()?.online,
                        'bg-red-500': !user()?.online
                      }"
                      class="absolute bottom-2 right-2 w-4 h-4 rounded-full border-2 border-white animate-pulse"
                    ></span>
                  </figure>

                  <section
                    class="space-y-3 transform transition-all duration-300"
                  >
                    <h1
                      class="text-2xl font-bold hover:text transition-colors duration-150 text"
                    >
                      {{ user()?.name }} {{ user()?.firstName }}
                    </h1>
                    <span
                      class="inline-block px-4 py-1.5 text-sm font-semibold rounded-full cursor-pointer transform transition-all duration-150 hover:scale-105"
                      [ngClass]="roleClasses()"
                    >
                      {{ user()?.role }}
                    </span>
                  </section>

                  <section class="mt-8 grid grid-cols-1 gap-6">
                    <section
                      class="border-t border-gray-700 pt-6 transition-all duration-150 hover:border-blue-500"
                    >
                      <h2
                        class="text-xl font-semibold text-white mb-3 hover:text transition-colors duration-150"
                      >
                        Contact
                      </h2>
                      <p
                        class="text-gray-300 flex items-center justify-center gap-2 group"
                      >
                        <span
                          class="font-semibold group-hover:text transition-colors duration-300"
                          >Email:</span
                        >
                        <span
                          class="group-hover:text-white transition-colors duration-150"
                          >{{ user()?.mail }}</span
                        >
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
  styleUrl: './view-user.component.scss',
})
export class ViewUserComponent {
  user = input<IUsers | null | undefined>();
  isPreview = input<boolean>(false);
  private readonly apiUrl = `${environment.apiUrl}`;

  readonly defaultImages = ImageUrl.defaultImages;

  readonly roleClasses = computed(() => {
    const role = this.user()?.role;
    const classes = {
      ADMIN: 'bg-blue-500/10 text-blue-500',
      USER: 'bg-green-500/10 text-green-500',
    };
    return (
      classes[role as unknown as keyof typeof classes] ||
      'bg-gray-500/10 text-gray-500'
    );
  });

  getImageSrc(): string {
    const imageUrl = this.user()?.imageUrl;
    if (!imageUrl) return this.defaultImages;

    if (imageUrl.startsWith('data:') || imageUrl.startsWith('../')) {
      return imageUrl;
    }

    return `${this.apiUrl}/images/upload/${imageUrl}`;
  }

  handleImageError(event: any) {
    event.target.src = this.defaultImages;
  }
}
