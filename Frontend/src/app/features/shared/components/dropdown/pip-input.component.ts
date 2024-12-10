import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-pin-input',
  templateUrl: './pin-input.component.html',
  standalone: true,
  imports: [CommonModule],
})

export class PinInputComponent {
  pinValues = signal(['', '', '', '']); // Les valeurs des inputs PIN

  updatePin(index: number, event: Event) {
    const inputElement = event.target as HTMLInputElement; // Cast explicite dans le TypeScript
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
    if (!inputElement) return; // Sécurité si l'élément est null

    const input = inputElement as HTMLInputElement;
    if (input.value === '' && index > 0) {
      const prevInput = input.previousElementSibling as HTMLInputElement | null;
      prevInput?.focus();
    }
  }
}
