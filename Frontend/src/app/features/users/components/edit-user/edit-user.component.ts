import { ImageUrl } from './../../../../../../public/images/constant.images';
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

  private _previewImageUrl = signal<string | null>(null);
  readonly previewImageUrl = computed(() => this._previewImageUrl());

  // Inject services
  private readonly fb = inject(FormBuilder);
  readonly userStore = inject(UserStore);
  private readonly toastr = inject(ToastrService);
  readonly authService = inject(AuthService);

  isUserRole = computed(() => this.currentUserRole() === ROLE.USER);

  activeTab = signal<'details' | 'image'>('details');
  detailsForm!: FormGroup;
  imageForm!: FormGroup;

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
          this.detailsForm.get('role')?.disable();
        }
      },
      error: () => {
        this.toastr.error('Error loading user role');
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
    this.detailsForm = this.fb.group({
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

    this.imageForm = this.fb.group({
      imageFile: [''],
    });

    this.detailsForm.valueChanges.subscribe((values) => {
      this.updatePreview({ ...values, imageFile: this.previewUser.imageFile });
    });
  }

  private patchForm(): void {
    if (this.detailsForm && this.user()) {
      this.detailsForm.patchValue({
        name: this.user()!.name || '',
        firstName: this.user()!.firstName || '',
        mail: this.user()!.mail || '',
        role: this.user()!.role || 'USER',
      });
    }
  }

  onSubmitDetails(): void {
    if (this.detailsForm.valid && this.user) {
      const userData = this.detailsForm.value;
      const userId = this.user()?.id;
      if (!userId) return;

      this.userStore
        .updateUserDetails(userId, userData)
        .pipe(
          tap(() => {
            this.toastr.success(
              `<span class="msg-class">${userData.firstName}</span> updated successfully`
            );
            this.userEdited.emit();

            setTimeout(() => {
              this.userStore.loadUsers(this.userStore.users()).unsubscribe();
            }, 200);
          })
        )
        .subscribe();
    }
  }

  onSubmitImage(): void {
    if (this.selectedFileName && this.user()) {
      const fileInput = this.fileInput()?.nativeElement;
      if (fileInput && fileInput.files?.[0]) {
        const userId = this.user()!.id;
        this.userStore
          .updateUserImages(userId, fileInput.files[0])
          .pipe(
            tap(() => {
              this.toastr.success('Profile picture updated successfully');
              this.userEdited.emit();
              this.selectedFileName = null;
              setTimeout(() => {
                this.userStore.loadUsers(this.userStore.users()).unsubscribe();
              }, 200);
            })
          )
          .subscribe();
      }
    }
  }

  // Init preview
  private initPreview(): void {
    const currentImageUrl = this.user()?.imageUrl;

    let imageUrl: string;
    if (this._previewImageUrl()) {
      imageUrl = this._previewImageUrl()!;
    } else if (currentImageUrl) {
      imageUrl = `${currentImageUrl}`;
    } else {
      imageUrl = ImageUrl.defaultImages;
    }

    this.previewUser = {
      ...this.user(),
      imageUrl: imageUrl,
    };
  }

  // Update preview
  private updatePreview(values: any): void {
    const currentImageUrl =
      this.previewUser?.imageUrl || ImageUrl.defaultImages;

    this.previewUser = {
      ...this.previewUser,
      name: values.name,
      firstName: values.firstName,
      mail: values.mail,
      role: values.role,
      imageUrl: this._previewImageUrl() || currentImageUrl,
    };
  }

  // Trigger file input
  triggerFileInput(): void {
    this.fileInput()?.nativeElement.click();
  }

  selectedFileName: string | null = null;

  get displayedFileName(): string {
    if (!this.selectedFileName) {
      return 'Upload your profile Picture';
    }

    const maxLength = 100;

    if (this.selectedFileName.length > maxLength) {
      return this.selectedFileName.substring(0, maxLength) + '...';
    } else {
      return this.selectedFileName;
    }
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedFileName = file.name;
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const imageUrl = e.target?.result as string;
        this._previewImageUrl.set(imageUrl);
        this.imageForm.patchValue({ imageFile: file });

        this.previewUser = {
          ...this.previewUser,
          imageUrl: imageUrl,
        };
      };
      reader.readAsDataURL(file);
    }
  }

  setActiveTab(tab: 'details' | 'image'): void {
    this.activeTab.set(tab);
  }

  // Get error message
  getErrorMessage(field: string, formType: 'details' | 'image'): string {
    const form = formType === 'details' ? this.detailsForm : this.imageForm;
    const control = form.get(field);
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
