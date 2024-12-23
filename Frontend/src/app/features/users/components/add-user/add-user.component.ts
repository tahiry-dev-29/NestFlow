import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserStore } from '../../store/users.store';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.scss'
})
export class AddUserComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;

  private fb = inject(FormBuilder);
  private store = inject(UserStore);
  private readonly toastr = inject(ToastrService);
  private router = inject(Router);

  userForm: FormGroup = this.fb.group({
    fullname: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]],
    status: ['active', Validators.required],
    image: ['']
  });

  selectedFileName: string | null = null;


  onSubmit(): void {
    if (this.userForm.valid) {
      const fullname = this.userForm.get('fullname')?.value;
      this.store.addUser(this.userForm.value);
      this.userForm.reset();
      this.selectedFileName = null;
      this.toastr.success(`Utilisateur <span class="msg-class">${fullname}</span> ajouté avec succès`)
    }
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
      };
      reader.readAsDataURL(file);
    }
  }
}
