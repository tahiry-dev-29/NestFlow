import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { slideInOut } from '../../../shared/animations/animations';
import { UserStore } from '../../store/users.store';
import { IUsers } from '../../models/users/users.module';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <main class="mt-0 transition-all duration-200 ease-in-out">
    <div class="flex flex-col items-center">
        <div class="w-full max-w-md px-3 mx-auto">
            <div
                class="relative z-0 flex flex-col min-w-0 break-words bg-slate-850/80 border-0 animate-shadow-pulse rounded-2xl">
                <div class="flex-auto p-6 mt-6">
                    <form [formGroup]="userForm" (ngSubmit)="onSubmit()" role="form text-left" class="flex flex-col">
                        <div class="mb-4">
                            <input type="text" formControlName="fullname" class="input-theme w-full"
                                placeholder="Full Name" />
                            <div *ngIf="userForm.get('fullname')?.invalid && userForm.get('fullname')?.touched"
                                class="error">
                                <small *ngIf="userForm.get('fullname')?.errors?.['required']">Full Name is
                                    required.</small>
                                <small *ngIf="userForm.get('fullname')?.errors?.['minlength']">Full Name must contain at
                                    least 5
                                    characters.</small>
                                <small *ngIf="userForm.get('fullname')?.errors?.['maxlength']">Full Name must contain at
                                    most 100
                                    characters.</small>
                            </div>
                        </div>
                        <div class="mb-4">
                            <input type="email" formControlName="email" class="input-theme w-full"
                                placeholder="Email" />
                            <div *ngIf="userForm.get('email')?.invalid && userForm.get('email')?.touched" class="error">
                                <small *ngIf="userForm.get('email')?.errors?.['required']">Email is required.</small>
                                <small *ngIf="userForm.get('email')?.errors?.['email']">Email is invalid.</small>
                            </div>
                        </div>
                        <div class="mb-4">
                            <select formControlName="status" class="input-theme w-full">
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        <div class="mb-4 relative">
                            <button type="button" (click)="triggerFileInput()"
                                class="input-theme w-full flex items-center justify-center text-sm font-medium text-gray-300 bg-slate-800/80 hover:bg-slate-700/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500/25">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                {{selectedFileName || 'Ajouter une image'}}
                            </button>
                            <input #fileInput type="file" (change)="onFileSelected($event)" accept="image/*"
                                class="hidden">
                        </div>
                        <div class="flex justify-center">
                            <button type="submit" [disabled]="userForm.invalid" class="w-3/4"
                                [ngClass]="{'btn-desactived-bg': !userForm.valid, 'btn-gradient-bg': userForm.valid}">
                                Edit
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</main>
  
  `,
  styleUrl: './edit-user.component.scss',
  animations: [slideInOut]
})
export class EditUserComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;
  @Input() user: null | IUsers = null;
  
  selectedFileName: string | null = null;
  userForm!: FormGroup;
  private readonly store = inject(UserStore);
  private readonly toastr = inject(ToastrService);
  private readonly fb = inject(FormBuilder);
  private userStore = inject(UserStore);




  ngOnInit(): void {
    this.initForm(this.user);
  }

  initForm(user: IUsers | null): void {
    this.userForm = this.fb.group({
      fullname: [user?.name || '', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      email: [user?.mail || '', [Validators.required, Validators.email]],
      status: [user?.online || 'active', Validators.required],
      image: [user?.imageUrl || null]
    });
  }

  onSubmit(): void {
    if (this.userForm.valid && this.user) {
      const updatedUser = { ...this.user, ...this.userForm.value };
      const { id: userId, ...userUpdates } = updatedUser; 
      this.store.updateUser(userId, userUpdates);
      this.userStore.loadUsers([]);
      this.toastr.success(`User <span class="msg-class">${updatedUser.fullname}</span> updated successfully`);
    } else {
      this.toastr.error('Please fill in all fields correctly');
      this.userForm.markAllAsTouched();
    }
  }

  triggerFileInput(): void {
    if (this.fileInput) {
      this.fileInput.nativeElement.click();
    }
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
