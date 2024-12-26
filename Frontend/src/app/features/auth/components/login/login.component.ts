import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    CommonModule
  ],
  template: `
    <main class="mt-0 transition-all duration-200 ease-in-out flex justify-center items-center min-h-screen">
      <section class="container">
        <div class="flex flex-wrap justify-center">
          <div class="w-full max-w-full px-3 mx-auto md:flex-0 shrink-0 md:w-7/12 lg:w-5/12 xl:w-4/12">
            <div class="relative z-0 flex flex-col min-w-0 break-words bg-slate-850/80 border-0 animate-shadow-pulse rounded-2xl">
              <div class="pt-6 mb-0 text-center bg-slate-850/80 font-bold text-lg border-b-0 rounded-t-2xl">
                <h5 class="title">Login</h5>
              </div>
              <div class="flex-auto p-6">
                <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" role="form text-left">
                  <div class="mb-4">
                    <input type="email" formControlName="email" class="input-theme" placeholder="Email" />
                    <div *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" class="text-red-500">
                      <small *ngIf="loginForm.get('email')?.errors?.['required']">Email is required</small>
                      <small *ngIf="loginForm.get('email')?.errors?.['email']">Invalid email format</small>
                    </div>
                  </div>
                  <div class="mb-4">
                    <input type="password" formControlName="password" class="input-theme" placeholder="Password"/>
                    <div *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" class="text-red-500">
                      <small *ngIf="loginForm.get('password')?.errors?.['required']">Password is required</small>
                      <small *ngIf="loginForm.get('password')?.errors?.['minlength']">Password must be at least 6 characters long</small>
                    </div>
                  </div>
                  <div class="mb-4 flex items-center gap-2 px-3 text-gray-400">
                    <input type="checkbox" formControlName="rememberMe" class="mr-2 text-sm font-medium text-gray-300">
                    Remember me
                  </div>
                  <div class="text-center">
                    <button type="submit" [disabled]="loginForm.invalid" class="focus:outline-none right-blue-400" [ngClass]="{'btn-desactived-bg': loginForm.invalid, 'btn-gradient-bg': !loginForm.invalid}">Login</button>
                  </div>
                </form>
                <a routerLink="/dashboard" class="text ml-2">Dashboard</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  `,
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.login({ email, password }).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Login failed', error);
          // Handle login error (e.g., show error message)
        }
      });
    }
  }
}
