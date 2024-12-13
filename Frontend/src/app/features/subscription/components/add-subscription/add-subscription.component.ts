import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SubscriptionStore } from '../../store/subscribed.store';

@Component({
  selector: 'app-add-subscription',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-subscription.component.html',
  styleUrls: ['./add-subscription.component.scss'], 
})
export class AddSubscriptionComponent {
  private fb = inject(FormBuilder);
  private store = inject(SubscriptionStore);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  subscriptionForm: FormGroup = this.fb.group({
    fullname: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    tel: ['', [Validators.required]],
    adresse: ['', [Validators.required]],
  });

  onSubmit() {
    if (this.subscriptionForm.valid) {
      const newSubscription = {
        ...this.subscriptionForm.value,
        createdAt: new Date().toISOString(),
        progress: 0,
        active: true
      };

      this.store.addSubscription(newSubscription);
      this.toastr.success('Abonnement ajouté avec succès');
      this.loadListsSubscriptions();
    }
  }

  loadListsSubscriptions() {
    this.router.navigate(['/dashboard/subscriptions/list']);
  }

  onCancel() {
    this.loadListsSubscriptions();
  }
}
