import {
  Directive,
  ElementRef,
  HostListener,
  inject,
  signal,
} from '@angular/core';

@Directive({
  selector: '[appClickOutside]',
})
export class ClickOutsideDirective {
  // Signal pour contrôler l'état de visibilité
  sidebarOpen = signal<boolean>(true);

  // Injection de l'élément HTML cible
  private el = inject(ElementRef);

  // Écoute les clics dans le DOM
  @HostListener('document:click', ['$event.target'])
  onClick(targetElement: HTMLElement): void {
    const clickedInside = this.el.nativeElement.contains(targetElement);
    if (!clickedInside) {
      this.sidebarOpen.set(false); // Fermer le side-bar si le clic est à l'extérieur
    }
  }

  // Méthode pour réouvrir le side-bar (peut être appelée dans le composant parent)
  openSidebar() {
    this.sidebarOpen.set(true);
  }
}
