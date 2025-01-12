import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { slideInOut } from '../../../shared/animations/animations';
import { UserStore } from '../../store/users.store';
import { IUsers } from '../../models/users/users.module';
import { ViewUserComponent } from '../view-user/view-user.component';
import { ImageUrl } from '../../../../../../public/images/constant.images';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ViewUserComponent],
  template: `
    <section class="flex justify-around gap-5">
      <app-view-user [user]="previewUser" [isPreview]="true"></app-view-user>
    <main class="mt-0 transition-all duration-200 ease-in-out">
    <div class="flex flex-col items-center">
        <div class="w-full max-w-md px-3 mx-auto">
            <div class="relative z-0 flex flex-col min-w-0 break-words bg-slate-850/80 border-0 animate-shadow-pulse rounded-2xl">
                <div class="flex-auto p-6 mt-6">
                    <form [formGroup]="userForm" (ngSubmit)="onSubmit()" role="form text-left" class="flex flex-col">
                        <div class="mb-4">
                    <input type="text" formControlName="name" class="input-theme w-full" placeholder="Name" />
                    <div *ngIf="userForm.get('name')?.invalid && userForm.get('name')?.touched" class="error">
                      {{ getErrorMessage('name') }}
                    </div>
                  </div>
                  <div class="mb-4">
                    <input type="text" formControlName="firstName" class="input-theme w-full" placeholder="First Name" />
                    <div *ngIf="userForm.get('firstName')?.invalid && userForm.get('firstName')?.touched" class="error">
                      {{ getErrorMessage('firstName') }}
                            </div>
                        </div>
                        <div class="mb-4">
                    <input type="email" formControlName="email" class="input-theme w-full" placeholder="Email" />
                            <div *ngIf="userForm.get('email')?.invalid && userForm.get('email')?.touched" class="error">
                      {{ getErrorMessage('email') }}
                            </div>
                        </div>
                  <div class="mb-4">
                    <select formControlName="role" class="input-theme w-full">
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>
                        <div class="mb-4">
                            <select formControlName="status" class="input-theme w-full">
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                            </select>
                        </div>
                        <div class="mb-4 relative">
                            <button type="button" (click)="triggerFileInput()"
                      class="input-theme w-full flex items-center justify-center text-sm font-medium text-gray-300 bg-slate-800/80 hover:bg-slate-700/80">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                      {{ selectedFileName || 'Modifier l\'image' }}
                            </button>
                    <input #fileInput type="file" (change)="onFileSelected($event)" accept="image/*" class="hidden">
                        </div>
                        <div class="flex justify-center">
                            <button type="submit" [disabled]="userForm.invalid" class="w-3/4"
                                [ngClass]="{'btn-desactived-bg': !userForm.valid, 'btn-gradient-bg': userForm.valid}">
                      Modifier
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</main>
    </section>
  `,
  styleUrl: './edit-user.component.scss',
  animations: [slideInOut]
})
export class EditUserComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;
  @Input() user!: IUsers | null;
  @Output() userEdited = new EventEmitter<void>();
  
  selectedFileName: string = '';
  userForm!: FormGroup;
  previewUser: any;

  private readonly fb = inject(FormBuilder);
  private readonly userStore = inject(UserStore);
  private readonly toastr = inject(ToastrService);

  ngOnInit(): void {
    this.initForm();
    this.initPreview();
  }

  private initForm(): void {
    this.userForm = this.fb.group({
      name: [this.user?.name || '', [Validators.required, Validators.minLength(2)]],
      firstName: [this.user?.firstName || '', [Validators.required, Validators.minLength(2)]],
      email: [this.user?.mail || '', [Validators.required, Validators.email]],
      role: [this.user?.role || 'USER', Validators.required],
      status: [this.user?.online?.toString() || 'true', Validators.required],
      image: [null]
    });

    this.userForm.valueChanges.subscribe(values => {
      this.updatePreview(values);
    });
  }

  private initPreview(): void {
    this.previewUser = {
      ...this.user,
      imageUrl: this.user?.imageUrl ? `http://localhost:8080/api/images/upload/${this.user.imageUrl}` : ImageUrl.defaultImages
    };
  }

  private updatePreview(values: any): void {
    this.previewUser = {
      ...this.previewUser,
      name: values.name,
      firstName: values.firstName,
      mail: values.email,
      role: values.role,
      online: values.status === 'true'
    };
  }

  triggerFileInput(): void {
      this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      if (file.size > 5000000) {
        this.toastr.error('Image size should be less than 5MB');
        return;
      }
      
      this.selectedFileName = file.name;
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const imageUrl = e.target?.result as string;
        this.previewUser = {
          ...this.previewUser,
          imageUrl: imageUrl
        };
      };
      reader.readAsDataURL(file);
      this.userForm.patchValue({ image: file });
    }
  }

  async onSubmit(): Promise<void> {
    if (this.userForm.valid && this.user) {
      const formData = new FormData();
      const userData = this.userForm.value;

      formData.append('name', userData.name);
      formData.append('firstName', userData.firstName);
      formData.append('mail', userData.email);
      formData.append('role', userData.role);
      formData.append('online', userData.status);

      const imageFile = this.userForm.get('image')?.value;
      if (imageFile) {
        formData.append('imageFile', imageFile);
      }

      try {
        await this.userStore.updateUser(this.user.id, formData).toPromise();
        this.toastr.success('Utilisateur modifié avec succès');
        this.userStore.loadUsers([]);
        this.userEdited.emit();
      } catch (error: any) {
        console.error('Error updating user:', error);
        this.toastr.error(error.error?.message || 'Erreur lors de la modification de l\'utilisateur');
      }
    }
  }

  getErrorMessage(field: string): string {
    const control = this.userForm.get(field);
    if (!control?.errors || !control.touched) return '';

    const errors = control.errors;
    const errorMessages: { [key: string]: string } = {
      required: 'Ce champ est requis',
      email: 'Email invalide',
      minlength: `Minimum ${control.errors['minlength']?.requiredLength} caractères`
    };

    const firstError = Object.keys(errors)[0];
    return errorMessages[firstError] || 'Erreur de validation';
  }
}
