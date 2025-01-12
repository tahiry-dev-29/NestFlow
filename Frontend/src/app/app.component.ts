import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthStore } from './features/auth/store/auth.store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private authStore = inject(AuthStore);

  ngOnInit(): void {
    // Wrap in try-catch to prevent uncaught promise errors
    try {
      this.authStore.checkAuthStatus();
    } catch (error) {
      console.warn('Auth status check failed:', error);
    }
  }
}
