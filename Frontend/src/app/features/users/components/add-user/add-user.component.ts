import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserStore } from '../../store/users.store';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <main class="mt-0 transition-all duration-200 ease-in-out">
      <div class="flex flex-col items-center">
        <div class="w-full max-w-md px-3 mx-auto">
          <div class="relative z-0 flex flex-col min-w-0 break-words bg-slate-850/80 border-0 animate-shadow-pulse rounded-2xl">
            <div class="flex-auto p-6 mt-6">
              <form [formGroup]="userForm" (ngSubmit)="onSubmit()" role="form text-left" class="flex flex-col">
                <div class="mb-4">
                  <input type="text" formControlName="fullname" class="input-theme w-full" placeholder="Full Name" />
                  <div *ngIf="userForm.get('fullname')?.invalid && userForm.get('fullname')?.touched" class="error">
                    <small *ngIf="userForm.get('fullname')?.errors?.['required']">Full Name is required.</small>
                    <small *ngIf="userForm.get('fullname')?.errors?.['minlength']">Full Name must contain at least 5 characters.</small>
                    <small *ngIf="userForm.get('fullname')?.errors?.['maxlength']">Full Name must contain at most 100 characters.</small>
                  </div>
                </div>
                <div class="mb-4">
                  <input type="email" formControlName="email" class="input-theme w-full" placeholder="Email" />
                  <div *ngIf="userForm.get('email')?.invalid && userForm.get('email')?.touched" class="error">
                    <small *ngIf="userForm.get('email')?.errors?.['required']">Email is required.</small>
                    <small *ngIf="userForm.get('email')?.errors?.['email']">Email is invalid.</small>
                  </div>
                </div>
                <div class="mb-4">
                  <input type="password" formControlName="password" class="input-theme w-full" placeholder="Password" />
                  <div *ngIf="userForm.get('password')?.invalid && userForm.get('password')?.touched" class="error">
                    <small *ngIf="userForm.get('password')?.errors?.['required']">Password is required.</small>
                    <small *ngIf="userForm.get('password')?.errors?.['minlength']">Password must contain at least 4 characters.</small>
                  </div>
                </div>
                <div class="mb-4">
                  <select formControlName="status" class="input-theme w-full">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div class="mb-4 relative">
                  <button type="button" (click)="triggerFileInput()" class="input-theme w-full flex items-center justify-center text-sm font-medium text-gray-300 bg-slate-800/80 hover:bg-slate-700/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500/25">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    {{ selectedFileName || 'Ajouter une image' }}
                  </button>
                  <input #fileInput type="file" (change)="onFileSelected($event)" accept="image/*" class="hidden">
                  <div *ngIf="userForm.get('image')?.invalid && userForm.get('image')?.touched" class="text-red-500 text-xs mt-1">
                    <small>Image requise.</small>
                  </div>
                </div>
                <div class="flex justify-center">
                  <button type="submit" [disabled]="userForm.invalid" class="w-3/4" [ngClass]="{'btn-desactived-bg': !userForm.valid, 'btn-gradient-bg': userForm.valid}">
                    Ajouter
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  `,
  styleUrl: './add-user.component.scss'
})
export class AddUserComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;

  private fb = inject(FormBuilder);
  private store = inject(UserStore);
  private readonly toastr = inject(ToastrService);

  userForm: FormGroup = this.fb.group({
    fullname: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]],
    status: ['active', Validators.required],
    image: ['', Validators.required]
  });

  selectedFileName: string | null = null;

  onSubmit(): void {
    if (this.userForm.valid) {
      const fullname = this.userForm.get('fullname')?.value;
      this.store.addUser(this.userForm.value);
      this.userForm.reset();
      this.selectedFileName = null;
      this.toastr.success(`Utilisateur <span class="msg-class">${fullname}</span> ajouté avec succès`, '', { positionClass: 'toast-top-left' });
      this.userForm.markAsUntouched();
    }
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedFileName = file.name;
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const imageUrl = e.target?.result as string;
        this.userForm.patchValue({ image: imageUrl });
      };
      reader.readAsDataURL(file);
    }
  }
}
