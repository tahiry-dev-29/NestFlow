import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EditSubscription } from '../../interfaces/subscription.interface';
import { SubscriptionStore } from '../../store/store';
import { errorMessages } from '../../../../../constantes';

@Component({
  selector: 'app-edit-subscription',
  templateUrl: './edit-subscription.component.html',
  styleUrls: ['./edit-subscription.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class EditSubscriptionComponent {
  private fb = inject(FormBuilder);
  private store = inject(SubscriptionStore);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private route = inject(ActivatedRoute);

  editForm = this.fb.group({
    fullname: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
    tel: ['', [Validators.required, Validators.pattern(/^\d{10}$/), Validators.maxLength(10)]],
    adresse: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(60)]],
    code: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(4), Validators.pattern(/^\d+$/)]],
  });

  private markAllAsTouched() {
    Object.keys(this.editForm.controls).forEach(controlName => {
      const control = this.editForm.get(controlName);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const subscription = this.store.getById(id);
      if (subscription) {
        this.editForm.patchValue({
          fullname: subscription.details.fullname,
          email: subscription.details.email,
          tel: subscription.details.tel,
          adresse: subscription.details.adresse,
          code: "",
        });
        this.markAllAsTouched();
      } else {
        this.toastr.error('Subscription not found 🤦‍♂️');
        this.redirectToList();
      }
    }
  }

  onSubmit(): void {
    if (this.editForm.invalid) {
      this.toastr.error('Le formulaire est invalide.');
      return;
    }

    const formValue = this.editForm.value;
    const updatedSubscription: EditSubscription = {
      id: this.route.snapshot.paramMap.get('id') || '',
      fullname: formValue.fullname || '',
      email: formValue.email || '',
      tel: formValue.tel || '',
      adresse: formValue.adresse || '',
      code: formValue.code || '',
    };

    this.store.updateSubscription(updatedSubscription);
    this.toastr.success('Subscription updated successfully.');
    this.redirectToList();
  }

  redirectToList(): void {
    this.router.navigate(['/dashboard/subscriptions/list']);
  }

  getMessageError(controlName: string, errorName: string): string {
    return errorMessages[controlName][errorName];
  }
}