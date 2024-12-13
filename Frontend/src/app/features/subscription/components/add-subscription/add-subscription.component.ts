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
    subscriptionType: ['Basique', [Validators.required]],
    active: [true],
    progress: [0]
  });
  
  onSubmit() {
    if (this.subscriptionForm.valid) {
      const now = new Date();
      const formattedDate = now.toISOString().split('.')[0] + 'Z'; // Remove milliseconds
      const newSubscription = {
        ...this.subscriptionForm.value,
        createdAt: formattedDate,
      };
      this.store.addSubscription(newSubscription);
      this.toastr.success(`L'abonnement <span class="msg-class">${newSubscription.subscriptionType} de ${newSubscription.fullname}</span> ajouté avec succès`);
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
