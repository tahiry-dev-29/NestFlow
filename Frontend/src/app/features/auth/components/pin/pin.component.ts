import { Component, signal, inject } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-pin',
  standalone: true,
  imports: [],
  templateUrl: './pin.component.html',
  styleUrl: './pin.component.scss'
})
export class PINComponent {
  private readonly  location = inject(Location);

  pinValues = signal(['', '', '', '']);

  updatePin(index: number, event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value;

    const currentPin = [...this.pinValues()];
    currentPin[index] = value.slice(0, 1); // Limite à un seul caractère
    this.pinValues.set(currentPin);
  }

  // Navigation vers l'input suivant
  focusNext(index: number, inputElement: EventTarget | null) {
    if (!inputElement) return; // Sécurité si l'élément est null

    const input = inputElement as HTMLInputElement;
    if (input.value.length === 1 && index < this.pinValues().length - 1) {
      const nextInput = input.nextElementSibling as HTMLInputElement | null;
      nextInput?.focus();
    }
  }

  // Navigation vers l'input précédent
  focusPrevious(index: number, inputElement: EventTarget | null) {
    if (!inputElement) return;

    const input = inputElement as HTMLInputElement;
    if (input.value === '' && index > 0) {
      const prevInput = input.previousElementSibling as HTMLInputElement | null;
      prevInput?.focus();
    }
  }


  // Retour en arrière
  navigateBack() {
    this.location.back();
  }

  reloadPin() {
    window.location.reload();
  }
}
