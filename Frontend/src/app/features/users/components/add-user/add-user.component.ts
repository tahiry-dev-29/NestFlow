import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnInit, output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UserStore } from '../../store/users.store';
import { ViewUserComponent } from '../view-user/view-user.component';

@Component({
    selector: 'app-add-user',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, ViewUserComponent],
    template: `
    <section class="flex justify-around gap-5">
        <app-view-user [user]="previewUser"></app-view-user>
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
                                    <input type="text" formControlName="fullname" class="input-theme w-full" placeholder="Full Name" />
                                    <div *ngIf="userForm.get('fullname')?.invalid && userForm.get('fullname')?.touched" class="error">
                                        {{ getErrorMessage('fullname') }}
                                    </div>
                                </div>
                                <div class="mb-4">
                                    <input type="email" formControlName="email" class="input-theme w-full" placeholder="Email" />
                                    <div *ngIf="userForm.get('email')?.invalid && userForm.get('email')?.touched" class="error">
                                        {{ getErrorMessage('email') }}
                                    </div>
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
    userAdded = output();

    private fb = inject(FormBuilder);
    private store = inject(UserStore);
    private readonly toastr = inject(ToastrService);
    // private readonly authService = inject(AuthService);

    errorMessages: { [key: string]: string } = {
        fullname: 'Full name must contain at least 5 characters.',
        email: 'Please enter a valid email address.',
        password: 'Password must contain at least 4 characters.',
        confirmPassword: 'Passwords do not match.',
    };

    userForm: FormGroup = this.fb.group({
        fullname: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(4)]],
        confirmPassword: ['', Validators.required],
        status: ['active', Validators.required],
        image: ['']
    }, { validator: this.passwordMatchValidator });

    selectedFileName: string | null = null;
    previewUser: any = null;

    ngOnInit() {
        this.initializePreview();
        this.userForm.valueChanges.subscribe(() => this.updatePreview());
    }

    initializePreview() {
        this.previewUser = {
            fullname: '',
            email: '',
            password: '',
            status: 'active',
            image: ''
        };
    }

    updatePreview() {
        this.previewUser = this.getUserDetails();
    }

    onSubmit(): void {
        if (this.userForm.valid) {
            const fullname = this.userForm.get('fullname')?.value;
            this.store.signup(this.userForm.value);
            this.userForm.reset();
            this.selectedFileName = null;
            this.initializePreview();
            this.toastr.success(`Utilisateur <span class="msg-class">${fullname}</span> ajouté avec succès`);
            this.userAdded.emit();
        }
    }

    passwordMatchValidator(form: FormGroup) {
        const password = form.get('password');
        const confirmPassword = form.get('confirmPassword');
        if (password && confirmPassword && password.value !== confirmPassword.value) {
            confirmPassword.setErrors({ mismatch: true });
        } else {
            confirmPassword?.setErrors(null);
        }
    }

    getErrorMessage(field: string): string {
        if (field === 'confirmPassword' && this.userForm.get('confirmPassword')?.hasError('mismatch')) {
            return this.errorMessages[field];
        }
        return this.userForm.get(field)?.hasError('required') ? `${field} est requis.` : this.errorMessages[field] || '';
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
                this.updatePreview();
            };
            reader.readAsDataURL(file);
        }
    }

    getUserDetails() {
        return {
            fullname: this.userForm.get('fullname')?.value || '',
            email: this.userForm.get('email')?.value || '',
            password: this.userForm.get('password')?.value || '',
            status: this.userForm.get('status')?.value || 'active',
            image: this.userForm.get('image')?.value || ''
        };
    }
}
