import { Directive, Input, OnInit, WritableSignal, input, signal } from '@angular/core';

@Directive({
  selector: '[appToggle]',
})
export class ToggleDirective implements OnInit {
  @Input() toggleKey!: string;
  defaultState = input(false)

  static state: WritableSignal<Record<string, boolean>> = signal({});

  ngOnInit() {
    const key = this.toggleKey;

    if (!key) {
      console.error('La propriété [toggleKey] doit être définie.');
      return;
    }

    ToggleDirective.state.update((currentState) => ({
      ...currentState,
      [key]: currentState[key] ?? this.defaultState,
    }));
  }

  static toggle(key: string): void {
    ToggleDirective.state.update((currentState) => ({
      ...currentState,
      [key]: !(currentState[key] ?? false),
    }));
  }

  static isActive(key: string): boolean {
    return ToggleDirective.state()[key] ?? false;
  }
}