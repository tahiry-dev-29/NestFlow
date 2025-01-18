import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ISubscription, SubscriptionType } from '../../models/subscription.interface';
import { SubscriptionStore } from '../../store/store';

@Component({
  selector: 'app-edit-subscription',
  templateUrl: './edit-subscription.component.html',
  styleUrl: './edit-subscription.component.scss',
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
    fullname: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    tel: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    adresse: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
    password: ['', [Validators.required, Validators.minLength(4)]],
    subscriptionType: ['BASIC', [Validators.required]],
    channelCount: [250, [Validators.required]],
  });

  subscriptionTypes: Record<SubscriptionType, { channels: number }> = {
    BASIC: { channels: 250 },
    CLASSIC: { channels: 500 },
  };

  /* ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const subscription = this.store.getSubscriptionById(+id);
      if (subscription) {
        this.editForm.patchValue({
          fullname: subscription.fullname,
          email: subscription.email,
          tel: subscription.tel,
          adresse: subscription.adresse,
          subscriptionType: subscription.subscriptionType,
          channelCount: subscription.channelCount,
          password: subscription.password,
        });
      } else {
        this.toastr.error('Abonnement non trouvé');
        this.redirectToList();
      }
    }
  } */

  onSubmit(): void {
    if (this.editForm.invalid) {
      this.toastr.error('Le formulaire est invalide.');
      return;
    }

    const formValue = this.editForm.value;
    const updatedSubscription: Partial<ISubscription> = {
      fullname: formValue.fullname || '',
      email: formValue.email || '',
      tel: formValue.tel || '',
      adresse: formValue.adresse || '',
      subscriptionType: formValue.subscriptionType as SubscriptionType,
      channelCount: this.subscriptionTypes[formValue.subscriptionType as SubscriptionType].channels,
      password: formValue.password || '',
    };

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      // this.store.update(+id, updatedSubscription);
      this.redirectToList();
      this.toastr.success('Abonnement mis à jour avec succès.');
    } else {
      this.toastr.error('ID d\'abonnement non trouvé');
    }
  }

  onSubscriptionTypeChange(event: Event) {
    const selectedType = (event.target as HTMLSelectElement).value as SubscriptionType;
    this.editForm.patchValue({
      channelCount: this.subscriptionTypes[selectedType].channels,
    });
  }

  redirectToList(): void {
    this.router.navigate(['/dashboard/subscriptions/list']);
  }
}