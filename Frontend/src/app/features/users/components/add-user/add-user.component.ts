import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, inject, OnInit, output, Output, viewChild, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthStore } from '../../../auth/store/auth.store';
import { UserStore } from '../../store/users.store';
import { ViewUserComponent } from '../view-user/view-user.component';
import { ERROR_MESSAGES_FORM } from '../../../../../constantes';
import { UserEntity } from '../../models/users/users.module';

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
        mail: ['', [Validators.required, Validators.email]],
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
        mail: '',
        role: 'USER',
    };

    restForm() {
        this.userForm.reset({
            role: 'USER'
        });
    }

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
            formData.append('mail', userData.mail ?? '');
            formData.append('password', userData.password ?? '');
            formData.append('role', userData.role ?? 'USER');

            this.authStore.signup(formData);

            this.userForm.reset({
                role: 'USER'
            });
            this.userAdded.emit();
            this.userStore.loadUsers(this.userStore.users());
        }
    }


    // Setup form value changes
    private setupFormValueChanges() {
        this.userForm.valueChanges.subscribe(values => {
            this.previewUser = {
                ...this.previewUser,
                name: values.name,
                firstName: values.firstName,
                mail: values.mail,
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
            mail: ERROR_MESSAGES_FORM.EMAIL_INVALID,
            minlength: ERROR_MESSAGES_FORM.MIN_LENGTH,
        };

        const firstError = Object.keys(errors)[0];
        return errorMessages[firstError] || ERROR_MESSAGES_FORM.VALIDATION_ERROR;
    }
}
