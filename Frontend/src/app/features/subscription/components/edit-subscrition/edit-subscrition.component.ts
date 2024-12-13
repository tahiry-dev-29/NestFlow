
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-edit-subscrition',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-subscrition.component.html',
  styleUrl: './edit-subscrition.component.scss'
})
export class EditSubscritionComponent implements OnInit {
  editForm!: FormGroup;
  
  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.initForm();
  }
get subscriptionControls() {
  return (this.editForm.get('subscription') as FormArray).controls;
}
  private initForm() {
    this.editForm = this.fb.group({
      subscription: this.fb.array([
        this.fb.group({
          label: ['Full Name'],
          type: ['text'],
          placeholder: ['Enter full name'],
          value: ['', Validators.required]
        }),
        this.fb.group({
          label: ['Email'],
          type: ['email'],
          placeholder: ['Enter email address'],
          value: ['', [Validators.required, Validators.email]]
        }),
        this.fb.group({
          label: ['Phone Number'],
          type: ['tel'],
          placeholder: ['Enter phone number'],
          value: ['', Validators.required]
        }),
        this.fb.group({
          label: ['Address'],
          type: ['text'],
          placeholder: ['Enter address'],
          value: ['', Validators.required]
        })
      ]),
      terms: [false, Validators.requiredTrue]
    });
  }

  onSubmit() {
    if (this.editForm.valid) {
      const formData = this.editForm.value;
      // Handle form submission
      this.toastr.success('Subscription updated successfully!', 'Success');
    } else {
      this.toastr.error('Please fill all required fields', 'Error');
    }
  }
}