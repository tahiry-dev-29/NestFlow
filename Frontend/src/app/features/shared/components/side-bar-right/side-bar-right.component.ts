import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, Signal, computed, signal, viewChild } from '@angular/core';
import { slideInOut } from '../../animations/animations';

@Component({
  selector: 'app-side-bar-right',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen()) {
      <div class="fixed z-990 inset-0 backdrop-blur">
        <div class="fixed top-0 right-0 h-full bg-slate-900 shadow-lg flex flex-col" [@slideInOut]>
          <div class="flex justify-between items-center p-4 border-b border-gray-700">
            <h2 class="title animate-pulse">{{ title() }}</h2>
            <button (click)="onClose()" class="text-white hover:text-gray-300">
              <i class="material-icons">close</i>
            </button>
          </div>
          <div #sidebarContent class="flex-grow overflow-y-auto p-4 custom-scrolbar">
            <ng-content></ng-content>
          </div>
        </div>
      </div>
    }
  `,
  styleUrl: './side-bar-right.component.scss',
  animations: [slideInOut]
})
export class SideBarRightComponent {
  private _isOpen = signal(false);
  private _title = signal('');

  readonly isOpen: Signal<boolean> = computed(() => this._isOpen());
  readonly title: Signal<string> = computed(() => this._title());

  private onCloseSignal = signal<void>(undefined);
  private onClickOutsideSignal = signal<void>(undefined);

  sidebarContent = viewChild<ElementRef>('sidebarContent');
  setIsOpen(value: boolean) {
    this._isOpen.set(value);
  }

  setTitle(value: string) {
    this._title.set(value);
  }

  onClose(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.onCloseSignal.set(undefined);
    this._isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isOpen()) {
      return;
    }

    const sidebarElement = this.sidebarContent();
    if (!sidebarElement) {
      return;
    }

    const clickedElement = event.target as HTMLElement;
    
    const isToggleButton = clickedElement.closest('[data-toggle-sidebar]') || 
                          clickedElement.closest('button[data-toggle-sidebar] *');
    if (isToggleButton) {
        return;
    }

    // Vérifier si le clic est à l'intérieur du sidebar
    if (!sidebarElement.nativeElement.contains(clickedElement)) {
        this.onClickOutsideSignal.set(undefined);
        this._isOpen.set(false);
    }
  }
}
