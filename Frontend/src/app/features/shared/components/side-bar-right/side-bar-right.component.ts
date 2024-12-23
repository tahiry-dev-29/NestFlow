import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, input, output, viewChild } from '@angular/core';
import { slideInOut } from '../../animations/animations';

@Component({
  selector: 'app-side-bar-right',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen()) {
      <div class="fixed top-0 right-0 z-990 h-full w-85 bg-slate-900 shadow-lg flex flex-col" [@slideInOut]>
        <div class="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 class="title animate-pulse">{{ title() }}</h2>
          <button (click)="close()" class="text-white hover:text-gray-300">
            <i class="material-icons">close</i>
          </button>
        </div>
        <div #sidebarContent class="flex-grow overflow-y-auto p-4 custom-scrolbar">
          <ng-content></ng-content>
        </div>
      </div>
    }
  `,
  styleUrl: './side-bar-right.component.scss',
  animations: [slideInOut]
})
export class SideBarRightComponent {
  isOpen = input(false);
  title = input('');
  closeEvent = output<void>();
  clickOutside = output<void>();

  sidebarContent = viewChild<ElementRef>('sidebarContent');

  close() {
    this.closeEvent.emit();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const sidebarElement = this.sidebarContent();
    if (this.isOpen() && sidebarElement && !sidebarElement.nativeElement.contains(event.target as Node)) {
      this.clickOutside.emit();
    }
  }
}
