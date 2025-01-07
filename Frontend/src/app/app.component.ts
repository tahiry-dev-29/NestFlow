import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthStore } from './features/auth/store/auth.store';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet,],
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'nest-flow';
  private authStore = inject(AuthStore);

  ngOnInit(): void {
    this.authStore.checkAuthStatus();
  }
}
