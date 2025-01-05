import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable, of, Subject } from 'rxjs';
import { catchError, tap, takeUntil, switchMap } from 'rxjs/operators';
import { UserStore } from '../../../users/store/users.store';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
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
                <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" role="form text-left" [autocomplete]="true">
                  <div class="mb-4">
                    <input type="mail" formControlName="mail" class="input-theme" placeholder="email" />
                    <div *ngIf="loginForm.get('mail')?.invalid && loginForm.get('mail')?.touched" class="text-red-500">
                      <small *ngIf="loginForm.get('mail')?.errors?.['required']">mail is required</small>
                      <small *ngIf="loginForm.get('mail')?.errors?.['email']">Invalid mail format</small>
                    </div>
                  </div>
                  <div class="mb-4">
                    <input type="password" formControlName="password" class="input-theme" placeholder="Password" />
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
                    <button type="submit" [disabled]="loginForm.invalid || store.loading()" class="focus:outline-none right-blue-400" [ngClass]="{'btn-desactived-bg': loginForm.invalid || store.loading(), 'btn-gradient-bg': !loginForm.invalid && !store.loading()}">Login</button>
                  </div>
                </form>
                <div *ngIf="store.loading()" class="flex justify-center items-center gap-3">
                  <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                  <span class="ml-2 text-white animate-pulse duration-75">Chargement...</span>
                </div>
                <div *ngIf="store.error()" class="error">{{ store.error() }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  `,
  styleUrls: ['./login.component.scss'],
})

export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  readonly store = inject(UserStore);
  readonly fb = inject(FormBuilder);
  readonly router = inject(Router);
  readonly toastr = inject(ToastrService);
  readonly authService = inject(AuthService);

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      mail: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { mail, password } = this.loginForm.value;
      this.store.login({ mail, password });
      this.loginForm.reset();
    }
  }
}