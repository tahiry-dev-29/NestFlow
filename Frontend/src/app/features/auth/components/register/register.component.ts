import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  standalone: true,
})
export class RegisterComponent {
  private readonly router = inject(Router)
  load(){
    this.router.navigate(["/pin"])
  }
}
