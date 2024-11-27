import { Component } from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [
    RouterLink,
    MatCheckbox
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {}
