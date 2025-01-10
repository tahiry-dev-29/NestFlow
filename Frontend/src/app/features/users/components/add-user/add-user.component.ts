import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, inject, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthStore } from '../../../auth/store/auth.store';
import { ViewUserComponent } from '../view-user/view-user.component';
import { UserStore } from '../../store/users.store';
import { ImageUrl } from '../../../../../../public/images/constant.images';

@Component({
    selector: 'app-add-user',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, ViewUserComponent],
    template: `
    <section class="flex justify-around gap-5">
        <app-view-user [user]="previewUser" [isPreview]="true"></app-view-user>
        <main class="mt-0 transition-all duration-200 ease-in-out">
            <div class="flex flex-col items-center">
                <div class="w-85 max-w-md px-3 mx-auto">
                    <div class="relative z-0 flex flex-col min-w-0 break-words bg-slate-850/80 border-0 animate-shadow-pulse rounded-2xl">
                        <button type="button" (click)="userForm.reset()" class="text-gray-300 hover:text-white flex flex-row-reverse items-center pt-4 pr-4">
                            <i class="material-icons">refresh</i>
                        </button>
                        <div class="flex-auto p-6">
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
                                        <option value="USER">default (USER)</option>
                                        <option value="ADMIN">ADMIN</option>
                                        <option value="USER">USER</option>
                                    </select>
                                </div>
                                <div class="mb-4">
                                    <input type="password" formControlName="password" class="input-theme w-full" placeholder="Password" />
                                    <div *ngIf="userForm.get('password')?.invalid && userForm.get('password')?.touched" class="error">
                                        {{ getErrorMessage('password') }}
                                    </div>
                                </div>
                                <div class="mb-4">
                                    <input type="password" formControlName="confirmPassword" class="input-theme w-full" placeholder="Confirm Password" />
                                    <div *ngIf="userForm.get('confirmPassword')?.invalid && userForm.get('confirmPassword')?.touched" class="error">
                                        {{ getErrorMessage('confirmPassword') }}
                                    </div>
                                </div>
                                <div class="mb-4 relative">
                                    <button type="button" (click)="triggerFileInput()" class="input-theme w-full flex items-center justify-center text-sm font-medium text-gray-300 bg-slate-800/80 hover:bg-slate-700/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500/25">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        {{ selectedFileName || 'Ajouter une image (optionnel)' }}
                                    </button>
                                    <input #fileInput type="file" (change)="onFileSelected($event)" accept="image/*" class="hidden">
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
    </section>
    `,
    styleUrl: './add-user.component.scss'
})
export class AddUserComponent implements OnInit {
    @ViewChild('fileInput') fileInput!: ElementRef;
    @Output() userAdded = new EventEmitter<void>();
    
    userForm!: FormGroup;
    selectedFileName: string = '';
    previewUser: any = {
        name: '',
        firstName: '',
        email: '',
        role: 'USER',
        imageUrl: ImageUrl.defaultImages
    };

    private fb = inject(FormBuilder);
    private userStore = inject(UserStore);
    private toastr = inject(ToastrService);

    ngOnInit() {
        this.initForm();
        this.setupFormValueChanges();
    }

    private initForm() {
        this.userForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2)]],
            firstName: ['', [Validators.required, Validators.minLength(2)]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', Validators.required],
            role: ['USER'],
            image: [null]
        }, { validators: this.passwordMatchValidator });
    }

    private setupFormValueChanges() {
        this.userForm.valueChanges.subscribe(values => {
            this.previewUser = {
                ...this.previewUser,
                name: values.name,
                firstName: values.firstName,
                email: values.email,
                role: values.role
            };
        });
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

    async onSubmit() {
        if (this.userForm.valid) {
            const formData = new FormData();
            const userData = this.userForm.value;

            formData.append('name', userData.name);
            formData.append('firstName', userData.firstName);
            formData.append('mail', userData.email);
            formData.append('password', userData.password);
            formData.append('role', userData.role);

            const imageFile = this.userForm.get('image')?.value;
            if (imageFile) {
                formData.append('imageFile', imageFile);
            }

            try {
                await this.userStore.createUser(formData);
                this.toastr.success('Utilisateur créé avec succès');
                this.userStore.loadUsers([]);
                this.resetForm();
                this.userAdded.emit();
            } catch (error: any) {
                console.error('Error creating user:', error);
                this.toastr.error(error.error?.message || 'Erreur lors de la création de l\'utilisateur');
            }
        }
    }

    private resetForm() {
        this.userForm.reset({
            name: '',
            firstName: '',
            email: '',
            password: '',
            confirmPassword: '',
            role: 'USER',
            image: null
        });
        this.previewUser = {
            name: '',
            firstName: '',
            email: '',
            role: 'USER',
            imageUrl: ImageUrl.defaultImages
        };
        this.selectedFileName = '';
        if (this.fileInput) {
            this.fileInput.nativeElement.value = '';
        }
    }

    passwordMatchValidator(g: FormGroup) {
        return g.get('password')?.value === g.get('confirmPassword')?.value
            ? null
            : { mismatch: true };
    }

    getErrorMessage(field: string): string {
        const control = this.userForm.get(field);
        if (!control?.errors || !control.touched) return '';

        const errors = control.errors;
        const errorMessages: { [key: string]: string } = {
            required: 'Ce champ est requis',
            email: 'Email invalide',
            minlength: `Minimum ${control.errors['minlength']?.requiredLength} caractères`,
            mismatch: 'Les mots de passe ne correspondent pas'
        };

        const firstError = Object.keys(errors)[0];
        return errorMessages[firstError] || 'Erreur de validation';
    }
}
