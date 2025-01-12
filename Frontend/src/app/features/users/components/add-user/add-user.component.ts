import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, inject, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthStore } from '../../../auth/store/auth.store';
import { UserStore } from '../../store/users.store';
import { ViewUserComponent } from '../view-user/view-user.component';

@Component({
    selector: 'app-add-user',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, ViewUserComponent],
    templateUrl: './add-user.component.html',
    styleUrl: './add-user.component.scss'
})
export class AddUserComponent implements OnInit {
    @ViewChild('fileInput') fileInput!: ElementRef;
    @Output() userAdded = new EventEmitter<void>();
    
    private fb = inject(FormBuilder);
    private authStore = inject(AuthStore);
    private userStore = inject(UserStore);
    
    userForm = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(2)]],
        firstName: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        role: ['USER']
    }, { validators: this.passwordMatchValidator });
    
    selectedFileName: string = '';
    previewUser: any = {
        name: '',
        firstName: '',
        email: '',
        role: 'USER',
    };

    ngOnInit() {
        this.setupFormValueChanges();
        const passwordControl = this.userForm.get('password');
        const confirmPasswordControl = this.userForm.get('confirmPassword');

        passwordControl?.valueChanges.subscribe(() => {
            if (confirmPasswordControl?.touched) {
                confirmPasswordControl.updateValueAndValidity();
            }
        });
    }
    
    onSubmit() {
        if (this.userForm.valid) {
            const formData = new FormData();
            const userData = this.userForm.value;
    
            formData.append('name', userData.name ?? '');
            formData.append('firstName', userData.firstName ?? '');
            formData.append('mail', userData.email ?? '');
            formData.append('password', userData.password ?? '');
            formData.append('role', userData.role ?? 'USER');
    
            this.authStore.signup(formData);
            
            setTimeout(() => {
                this.resetForm();
                this.userAdded.emit();
                this.userStore.loadUsers([]);
            }, 1000);
        }
    }

    private resetForm() {
        this.userForm.reset({
            name: '',
            firstName: '',
            email: '',
            password: '',
            confirmPassword: '',
            role: 'USER'
        });
        this.previewUser = {
            name: '',
            firstName: '',
            email: '',
            role: 'USER',
        };
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

    passwordMatchValidator(g: FormGroup) {
        const password = g.get('password');
        const confirmPassword = g.get('confirmPassword');

        if (!password || !confirmPassword) return null;
        
        return password.value === confirmPassword.value 
            ? null 
            : { mismatch: true };
    }

    getErrorMessage(field: string): string {
        const control = this.userForm.get(field);
        if (!control?.errors || !control.touched) return '';

        const errors = control.errors;
        const formErrors = this.userForm.errors;

        if (field === 'confirmPassword' && formErrors?.['mismatch'] && control.touched) {
            return 'Password mismatch';
        }

        if (!errors) return '';

        const errorMessages: { [key: string]: string } = {
            required: 'This field is required',
            email: 'Invalid email',
            minlength: `Minimum ${errors['minlength']?.requiredLength} characters`,
        };

        const firstError = Object.keys(errors)[0];
        return errorMessages[firstError] || 'Validation error';
    }
}
