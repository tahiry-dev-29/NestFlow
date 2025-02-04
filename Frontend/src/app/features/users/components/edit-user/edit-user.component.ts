import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  ElementRef,
  inject,
  input,
  OnChanges,
  OnInit,
  output,
  signal,
  SimpleChanges,
  viewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { tap } from 'rxjs';
import { ImageUrl } from '../../../../../../public/images/constant.images';
import { AuthService } from '../../../auth/services/auth.service';
import { slideInOut } from '../../../shared/animations/animations';
import { IUsers, ROLE } from '../../models/users/users.module';
import { UserStore } from '../../store/users.store';
import { ViewUserComponent } from '../view-user/view-user.component';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ViewUserComponent],
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.scss',
  animations: [slideInOut],
})
export class EditUserComponent implements OnInit, OnChanges {
  readonly ROLE = ROLE;
  fileInput = viewChild<ElementRef>('fileInput');
  user = input<IUsers | null>(null);
  userEdited = output<void>();

  userForm!: FormGroup;
  previewUser: any;

  // Inject services
  private readonly fb = inject(FormBuilder);
  readonly userStore = inject(UserStore);
  private readonly toastr = inject(ToastrService);
  readonly authService = inject(AuthService);

  isUserRole = computed(() => this.currentUserRole() === ROLE.USER);

  ngOnInit(): void {
    this.initForm();
    this.initPreview();
    this.loadUserRole();
  }

  currentUser = signal<IUsers | null>(null);
  currentUserRole = computed(() => this.currentUser()?.role || null);

  loadUserRole(): void {
    const token = this.authService.getToken();
    this.authService.getUserByToken(token || '').subscribe({
      next: (user) => {
        this.currentUser.set(user);
        if (user?.role === ROLE.USER) {
          this.userForm.get('role')?.disable();
        }
      },
      error: (error) => {
        this.toastr.error('Error loading user role');
        console.error('Error:', error);
      },
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && !changes['user'].firstChange) {
      this.patchForm();
      this.initPreview();
    }
  }

  private initForm(): void {
    this.userForm = this.fb.group({
      name: [
        this.user()?.name || '',
        [Validators.required, Validators.minLength(2)],
      ],
      firstName: [
        this.user()?.firstName || '',
        [Validators.required, Validators.minLength(2)],
      ],
      mail: [this.user()?.mail || '', [Validators.required, Validators.email]],
      role: [
        {
          value: this.user()?.role || ROLE.USER,
          disabled: this.currentUserRole() === ROLE.USER,
        },
        Validators.required,
      ],
    });

    this.userForm.valueChanges.subscribe((values) => {
      this.updatePreview(values);
    });
  }

  private patchForm(): void {
    if (this.userForm && this.user()) {
      this.userForm.patchValue({
        name: this.user()!.name || '',
        firstName: this.user()!.firstName || '',
        mail: this.user()!.mail || '',
        role: this.user()!.role || 'USER',
      });
    }
  }

  onSubmit(): void {
    if (this.userForm.valid && this.user) {
      const formData = new FormData();
      const userData = this.userForm.value;

      formData.append('name', userData.name);
      formData.append('firstName', userData.firstName);
      formData.append('mail', userData.mail);
      formData.append('role', userData.role);

      const user = this.user();
      if (user) {
        const userId = user.id;
        this.userStore
          .updateUser(userId, userData)
          .pipe(
            tap(() => {
              this.toastr.success(
                `<span class="msg-class">${userData.firstName}</span> updated successfully`
              );
              this.userEdited.emit();
              this.userStore.loadUsers(this.userStore.users());
            })
          )
          .subscribe();
      } else {
        this.toastr.error('User not found');
      }
    }
  }

  // Init preview
  private initPreview(): void {
    this.previewUser = {
      ...this.user(),
      imageUrl: this.user()?.imageUrl
        ? `${this.user()?.imageUrl}`
        : ImageUrl.defaultImages,
    };
  }

  // Update preview
  private updatePreview(values: any): void {
    this.previewUser = {
      ...this.previewUser,
      name: values.name,
      firstName: values.firstName,
      mail: values.mail,
      role: values.role,
    };
  }
  // Trigger file input
  triggerFileInput(): void {
    this.fileInput()?.nativeElement.click();
  }

  // Get error message
  getErrorMessage(field: string): string {
    const control = this.userForm.get(field);
    if (!control?.errors || !control.touched) return '';

    const errors = control.errors;
    const errorMessages: { [key: string]: string } = {
      required: 'This field is required',
      mail: 'Invalid email',
      minlength: `Minimum ${control.errors['minlength']?.requiredLength} characters`,
    };

    const firstError = Object.keys(errors)[0];
    return errorMessages[firstError] || 'Validation error';
  }
}
