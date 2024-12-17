import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SubscriptionType, ISubscription } from '../../models/subscription.interface';
import { SUBSCRIPTION_SETTINGS, SubscriptionStore } from '../../store/subscribed.store';

@Component({
  selector: 'app-add-subscription',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-subscription.component.html',
  styleUrls: ['./add-subscription.component.scss'],
})
export class AddSubscriptionComponent implements OnInit {
  private fb = inject(FormBuilder);
  private store = inject(SubscriptionStore);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  subscriptionForm = this.fb.group({
    fullname: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$')]],
    tel: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    adresse: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
    subscriptionType: ['Basique', [Validators.required]],
    channelCount: [250, [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

  ngOnInit() {
    this.subscriptionForm.get('subscriptionType')?.valueChanges.subscribe((type) => {
      const channelCount = type === 'Classique' ? 500 : 250;
      this.subscriptionForm.patchValue({ channelCount }, { emitEvent: false });
    });
  }

  onSubmit() {
    if (this.subscriptionForm.valid) {
      const formValues = this.subscriptionForm.value;
      if (!formValues.fullname || !formValues.email || !formValues.tel || !formValues.adresse || !formValues.password) {
        this.toastr.error('Tous les champs obligatoires doivent être remplis.');
        return;
      }
      this.addSubscription();
    } else {
      this.toastr.error('Le formulaire est invalide.');
      this.subscriptionForm.markAllAsTouched();
    }
  }

  private calculateRemainingDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const difference = end.getTime() - start.getTime();
    return Math.ceil(difference / (1000 * 3600 * 24));
  }

  private addSubscription() {
    const formValues = this.subscriptionForm.value;

    const subscriptionType: SubscriptionType = formValues.subscriptionType === 'Classique' ? 'Classique' : 'Basique';
    const duration = SUBSCRIPTION_SETTINGS[subscriptionType]?.duration || 31;

    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const remainingDays = this.calculateRemainingDays(startDate, endDate);
    const progress = (remainingDays / duration) * 100;

    const newSubscription: ISubscription = {
      subscriptionStartDate: startDate,
      subscriptionEndDate: endDate,
      active: true,
      id: 0,
      fullname: formValues.fullname || '',
      email: formValues.email || '',
      tel: formValues.tel || '',
      adresse: formValues.adresse || '',
      subscriptionType,
      channelCount: formValues.channelCount || 250,
      password: formValues.password || '',
      progress: progress,
    };

    this.store.addSubscription(newSubscription);
    this.toastr.success(`Abonnement <span class="msg-class">${newSubscription.subscriptionType}</span> ajouté avec succès!`);
    this.redirectToList();
  }
  
  redirectToList() {
    this.router.navigate(['dashboard/subscriptions/list']);
  }
}
