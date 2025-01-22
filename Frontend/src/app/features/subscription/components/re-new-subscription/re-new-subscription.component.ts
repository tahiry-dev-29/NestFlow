// ReNewSubscriptionComponent
import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, computed, ElementRef, EventEmitter, Input, Output, signal, viewChild } from '@angular/core';

@Component({
  selector: 'app-re-new-subscription',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen$()) {
      <div class="fixed z-990 inset-0 backdrop-blur flex items-center justify-center" 
           (click)="onClickOutside($event)">
        <div class="bg-slate-900 shadow-lg flex flex-col w-[30rem] max-h-[80vh] rounded-lg" 
             [@fadeInOut]
             (click)="$event.stopPropagation()">
          <div class="flex justify-between items-center p-4 border-b border-gray-700 rounded-t-lg">
            <h2 class="text-xl font-bold text-white">{{ title$() }}</h2>
            <button (click)="onClose()" class="text-white hover:text-gray-300">
              <i class="material-icons">close</i>
            </button>
          </div>
          <div #popupContent class="flex-grow overflow-y-auto p-4 custom-scrollbar">
            <ng-content></ng-content>
          </div>
        </div>
      </div>
    }
  `,
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('150ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'scale(0.95)' }))
      ])
    ])
  ],
  styleUrl: './re-new-subscription.component.scss'
})
export class ReNewSubscriptionComponent {
  private _isOpen = signal(false);
  private _title = signal('Renouveler l\'abonnement');

  readonly isOpen$ = computed(() => this._isOpen());
  readonly title$ = computed(() => this._title());

  @Input() set isOpen(value: boolean) {
    this._isOpen.set(value);
  }
  
  @Input() set title(value: string) {
    this._title.set(value);
  }
  
  @Output() close = new EventEmitter<void>();

  popupContent = viewChild<ElementRef>('popupContent');

  onClose(): void {
    this.close.emit();
  }

  onClickOutside(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }
}