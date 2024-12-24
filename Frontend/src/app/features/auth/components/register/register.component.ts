import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  template: `
    <main class="mt-0 flex justify-center items-center min-h-screen">
      <section class="container">
        <div class="flex flex-wrap justify-center">
          <div class="w-full max-w-full px-3 mx-auto md:flex-0 shrink-0 md:w-7/12 lg:w-5/12 xl:w-4/12">
            <div class="relative z-0 flex flex-col min-w-0 break-words bg-slate-850/80 border-0 animate-shadow-pulse rounded-2xl bg-clip-border">
              <div class="pt-6 mb-0 text-center bg-slate-850/80 font-bold text-lg border-b-0 rounded-t-2xl">
                <h5 class="title">Sign Up</h5>
              </div>
              <div class="flex-auto p-6">
                <form [formGroup]="signupForm" (ngSubmit)="onSubmit()" role="form text-left">
                  <div class="mb-4">
                    <input type="email" formControlName="email" class="input-theme" placeholder="Email" />
                    <div *ngIf="signupForm.get('email')?.invalid && signupForm.get('email')?.touched" class="text-red-500 text-xs mt-1">
                      {{ getErrorMessage('email') }}
                    </div>
                  </div>
                  <div class="mb-4">
                    <input type="password" formControlName="password" class="input-theme" placeholder="Password" />
                    <div *ngIf="signupForm.get('password')?.invalid && signupForm.get('password')?.touched" class="text-red-500 text-xs mt-1">
                      {{ getErrorMessage('password') }}
                    </div>
                  </div>
                  <div class="mb-4">
                    <input type="password" formControlName="confirmPassword" class="input-theme" placeholder="Confirm Password" />
                    <div *ngIf="(signupForm.get('confirmPassword')?.invalid && signupForm.get('confirmPassword')?.touched) || signupForm.hasError('mismatch')" class="text-red-500 text-xs mt-1">
                      {{ getErrorMessage('confirmPassword') }}
                    </div>
                  </div>
                  <div class="mb-4 flex items-center text-gray-400">
                    <input type="checkbox" formControlName="agreeTerms" class="mr-2">
                    I agree to the <span class="font-bold text ml-2">Terms and Conditions</span>
                  </div>
                  <div class="text-center">
                    <button type="submit" [disabled]="signupForm.invalid" [ngClass]="{'btn-desactived-bg': signupForm.invalid, 'btn-gradient-bg': !signupForm.invalid}" class="focus:outline-none right-blue-400">Sign up</button>
                  </div>
                  <p class="mt-4 mb-0 leading-normal text-sm flex justify-center text-gray-400">Already have an account? <a routerLink="/login" class="text ml-2">Sign in</a></p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  `,
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  signupForm: FormGroup;
  errorMessages: { [key: string]: string } = {
    email: 'Veuillez entrer une adresse e-mail valide.',
    password: 'Le mot de passe doit contenir au moins 6 caractères.',
    confirmPassword: 'Les mots de passe ne correspondent pas.',
  };

  constructor() {
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      agreeTerms: [false]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    return password && confirmPassword && password.value === confirmPassword.value ? null : { mismatch: true };
  }

  getErrorMessage(field: string): string {
    if (field === 'confirmPassword' && this.signupForm.hasError('mismatch')) {
      return this.errorMessages[field];
    }
    return this.signupForm.get(field)?.hasError('required') ? `${field} est requis.` : this.errorMessages[field];
  }

  onSubmit() {
    if (this.signupForm.valid) {
      const userData = {
        email: this.signupForm.get('email')?.value,
        password: this.signupForm.get('password')?.value
      };
      this.authService.signUp(userData).pipe(
        tap(response => {
          console.log('Inscription réussie', response);
          this.router.navigate(['/pin']);
        }),
        catchError(error => {
          console.error('Échec de l\'inscription', error);
          this.showErrorMessage(error.message || 'Une erreur s\'est produite lors de l\'inscription.');
          return of(null);
        })
      ).subscribe();
    } else {
      this.showErrorMessage('Veuillez corriger les erreurs dans le formulaire.');
    }
  }

  showErrorMessage(message: string) {
    console.error(message);
    // Implémentez ici la logique pour afficher le message d'erreur à l'utilisateur
    // Par exemple, vous pouvez utiliser un service de notification ou un composant d'alerte
  }
}