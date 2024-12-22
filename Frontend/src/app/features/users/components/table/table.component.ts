import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Component, ElementRef, HostListener, ViewChild, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { slideInOut } from '../../../shared/animations/animations';
import { PopupsComponent } from "../../../shared/components/popups/popups.component";
import { UserStore } from '../../store/users.store';
import { AddUserComponent } from "../add-user/add-user.component";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ImageUrl } from '../../../../../../public/images/constant.images';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, AddUserComponent, PopupsComponent, NgxPaginationModule, ReactiveFormsModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
  animations: [slideInOut],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class TableComponent {
  showPopup = signal(false);
  userIdToDelete: number | null = null;
  currentPage = 1;
  showEditUserSidebar = signal(false);
  userToEdit: any = null;
  selectedUser: any = null;
  userForm!: FormGroup;
  userId: number | null = null;
  p: number = 1;

  readonly defaultImages = ImageUrl.defaultImages;

  readonly store = inject(UserStore);
  readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);
  private readonly fb = inject(FormBuilder);

  showAddUserSidebar = signal(false);

  @ViewChild('sidebarContent') sidebarContent!: ElementRef;
  @ViewChild('editSidebarContent') editSidebarContent!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor() {
    this.initForm();
  }

  initForm(user: any = null) {
    this.userForm = this.fb.group({
      fullname: [user?.fullname || '', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      email: [user?.email || '', [Validators.required, Validators.email]],
      password: ['', user ? [] : [Validators.required, Validators.minLength(4)]],
      confirmPassword: ['', user ? [] : [Validators.required]],
      status: [user?.status || 'active', Validators.required],
      image: [user?.image || null, Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.showAddUserSidebar() && this.sidebarContent && !this.sidebarContent.nativeElement.contains(event.target)) {
      this.closeSidebar();
    }
    if (this.showEditUserSidebar() && this.editSidebarContent && !this.editSidebarContent.nativeElement.contains(event.target)) {
      this.closeEditSidebar();
    }
  }

  confirmDelete() {
    if (this.userIdToDelete !== null) {
      this.store.deleteUser(this.userIdToDelete);
      this.toastr.success('User deleted successfully');
      this.closePopup();
    }
  }

  closePopup() {
    this.showPopup.set(false);
    this.userIdToDelete = null;
  }

  openPopup(userId: number) {
    this.userIdToDelete = userId;
    this.showPopup.set(true);
  }

  openEditSidebar(user: any) {
    this.userToEdit = user;
    this.initForm(user);
    this.showEditUserSidebar.set(true);
  }

  openSidebar(user: any) {
    this.selectedUser = user;
    this.showAddUserSidebar.set(true);
  }

  closeSidebar() {
    this.showAddUserSidebar.set(false);
    this.initForm();
  }

  closeEditSidebar() {
    this.showEditUserSidebar.set(false);
    this.userToEdit = null;
    this.initForm();
  }

  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const userData = this.userForm.value;
      if (this.userToEdit) {
        const updatedUser = { ...this.userToEdit, ...userData };
        this.store.updateUser(updatedUser.id, updatedUser);
        this.toastr.success('User updated successfully');
        this.closeEditSidebar();
      } else {
        this.store.addUser(userData);
        this.toastr.success('User added successfully');
        this.closeSidebar();
      }
    } else {
      this.toastr.error('Please fill all fields correctly');
      this.userForm.markAllAsTouched();
    }
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  selectedFileName: string | null = null;
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
