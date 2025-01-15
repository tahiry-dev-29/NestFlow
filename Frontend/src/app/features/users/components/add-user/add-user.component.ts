import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, inject, OnInit, output, Output, viewChild, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthStore } from '../../../auth/store/auth.store';
import { UserStore } from '../../store/users.store';
import { ViewUserComponent } from '../view-user/view-user.component';
import { ERROR_MESSAGES_FORM } from '../../../../../constantes';

@Component({
    selector: 'app-add-user',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, ViewUserComponent],
    templateUrl: './add-user.component.html',
    styleUrl: './add-user.component.scss'
})
export class AddUserComponent implements OnInit {
    fileInput = viewChild<ElementRef>('fileInput');
    userAdded = output<void>();

    // Injects
    private fb = inject(FormBuilder);
    private authStore = inject(AuthStore);
    private userStore = inject(UserStore);

    // Form group
    userForm = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(2)]],
        firstName: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        role: ['USER']
    }, { validators: this.passwordMatchValidator });

    // Selected file name
    selectedFileName: string = '';

    // Preview user
    previewUser: any = {
        name: '',
        firstName: '',
        email: '',
        role: 'USER',
    };

    // On init
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

    // On submit
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

    // Reset form
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

    // Setup form value changes
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

    // Password match validator
    passwordMatchValidator(g: FormGroup) {
        const password = g.get('password');
        const confirmPassword = g.get('confirmPassword');

        if (!password || !confirmPassword) return null;
        
        return password.value === confirmPassword.value 
            ? null 
            : { mismatch: true };
    }

    // Get error message
    getErrorMessage(field: string): string {
        const control = this.userForm.get(field);
        if (!control?.errors || !control.touched) return '';

        const errors = control.errors;
        const formErrors = this.userForm.errors;

        if (field === 'confirmPassword' && formErrors?.['mismatch'] && control.touched) {
            return ERROR_MESSAGES_FORM.PASSWORD_MISMATCH;
        }

        if (!errors) return '';

        const errorMessages: { [key: string]: string } = {
            required: ERROR_MESSAGES_FORM.REQUIRED,
            email: ERROR_MESSAGES_FORM.EMAIL_INVALID,
            minlength: ERROR_MESSAGES_FORM.MIN_LENGTH,
        };

        const firstError = Object.keys(errors)[0];
        return errorMessages[firstError] || ERROR_MESSAGES_FORM.VALIDATION_ERROR;
    }
}
