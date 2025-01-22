import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, input, OnChanges, OnInit, output, SimpleChanges, viewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { tap } from 'rxjs';
import { ImageUrl } from '../../../../../../public/images/constant.images';
import { slideInOut } from '../../../shared/animations/animations';
import { IUsers } from '../../models/users/users.module';
import { UserStore } from '../../store/users.store';
import { ViewUserComponent } from '../view-user/view-user.component';

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
                    <input type="email" formControlName="mail" class="input-theme w-full" placeholder="Email" />
                    <div *ngIf="userForm.get('mail')?.invalid && userForm.get('mail')?.touched" class="error">
                      {{ getErrorMessage('mail') }}
                    </div>
                  </div>
                  <div class="mb-4">
                    <select formControlName="role" class="input-theme w-full">
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>

                  <div class="flex justify-center">
                    <button type="submit" [disabled]="userForm.invalid" class="w-3/4"
                      [ngClass]="{'btn-desactived-bg': !userForm.valid, 'btn-gradient-bg': userForm.valid}">
                      Update {{user()?.firstName}}
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
export class EditUserComponent implements OnInit, OnChanges {
  // @ViewChild('fileInput') fileInput!: ElementRef;
  fileInput = viewChild<ElementRef>('fileInput');
  user = input<IUsers | null>(null);
  userEdited = output<void>();

  selectedFileName: string = '';
  userForm!: FormGroup;
  previewUser: any;

  // Inject services
  private readonly fb = inject(FormBuilder);
  private readonly userStore = inject(UserStore);
  private readonly toastr = inject(ToastrService);

  // On init
  ngOnInit(): void {
    this.initForm();
    this.initPreview();
  }

  // On changes
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && !changes['user'].firstChange) {
      this.patchForm();
      this.initPreview();
    }
  }


  private initForm(): void {
    this.userForm = this.fb.group({
      name: [this.user()?.name || '', [Validators.required, Validators.minLength(2)]],
      firstName: [this.user()?.firstName || '', [Validators.required, Validators.minLength(2)]],
      mail: [this.user()?.mail || '', [Validators.required, Validators.email]],
      role: [this.user()?.role || 'USER', Validators.required]
    });

    this.userForm.valueChanges.subscribe(values => {
      this.updatePreview(values);
    });
  }

  // Patch form
  private patchForm(): void {
    if (this.userForm && this.user()) {
      this.userForm.patchValue({
        name: this.user()!.name || '',
        firstName: this.user()!.firstName || '',
        mail: this.user()!.mail || '',
        role: this.user()!.role || 'USER'
      });
    }
  }

  // On submit
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
        this.userStore.updateUser(userId, userData).pipe(
          tap(() => {
            this.toastr.success(`${userData.firstName} updated successfully`);
            this.userEdited.emit();
            this.userStore.loadUsers(this.userStore.users());
          })
        ).subscribe();
      } else {
        this.toastr.error('User not found');
      }
    }
  }

  // Init preview
  private initPreview(): void {
    this.previewUser = {
      ...this.user(),
      imageUrl: this.user()?.imageUrl ? `${this.user()?.imageUrl}` : ImageUrl.defaultImages
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
