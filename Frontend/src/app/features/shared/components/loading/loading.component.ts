import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [],
  template: `
  <div class="loader">
    <span class="loader-text">{{ text() }}</span>
      <span class="load"></span>
  </div>

  `,
  styleUrl: './loading.component.scss'
})
export class LoadingComponent {
  text = input.required<string>();
}
