import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserStore } from './features/users/store/users.store';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet,],
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'nest-flow';
  private userStore = inject(UserStore);

  ngOnInit(): void {
    this.userStore.checkAuthStatus();
  }
}
