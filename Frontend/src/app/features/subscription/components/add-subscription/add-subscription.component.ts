import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SubscriptionStore } from '../../store/subscribed.store';
import { ISubscription, SubscriptionType } from '../../models/subscription.interface';

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

  subscriptionForm = this.fb.group({
    fullname: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    tel: ['', [Validators.required]],
    adresse: ['', [Validators.required]],
    subscriptionType: ['Basique', [Validators.required]],
    channelCount: [250, [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    active: [true],
    progress: [0]
  });

  constructor() {
    // Subscribe to subscription type changes
    this.subscriptionForm.get('subscriptionType')?.valueChanges.subscribe(type => {
      if (type === 'Basique') {
        this.subscriptionForm.patchValue({ channelCount: 250 }, { emitEvent: false });
      } else if (type === 'Classique') {
        this.subscriptionForm.patchValue({ channelCount: 500 }, { emitEvent: false });
      }
    });
  }
  
  onSubmit() {
    if (this.subscriptionForm.valid) {
      const now = new Date();
      const formattedDate = now.toISOString().split('.')[0] + 'Z'; // Remove milliseconds
      const formValues = this.subscriptionForm.value;
      const newSubscription: Omit<ISubscription, 'id'> = {
        fullname: formValues.fullname || '',
        email: formValues.email || '',
        tel: formValues.tel || '',
        adresse: formValues.adresse || '',
        subscriptionType: (formValues.subscriptionType || 'Basique') as SubscriptionType,
        channelCount: formValues.channelCount || 250,
        password: formValues.password || '',
        active: formValues.active ?? true,
        progress: formValues.progress ?? 0,
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
