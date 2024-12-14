import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SubscriptionStore } from '../../store/subscribed.store';
import { ISubscription, SubscriptionType, TypeNewSubscription } from '../../models/subscription.interface';

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
    tel: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]], // 10 chiffres
    adresse: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
    subscriptionType: ['Basique', [Validators.required]],
    channelCount: [250, [Validators.required]], // Défini dynamiquement
    password: ['', [Validators.required, Validators.minLength(4)]],
    active: [true],
    progress: [0],
  });

  ngOnInit() {
    // Abonnement aux changements de `subscriptionType` pour ajuster `channelCount`
    this.subscriptionForm.get('subscriptionType')?.valueChanges.subscribe((type) => {
      const channelCount = type === 'Classique' ? 500 : 250;
      this.subscriptionForm.patchValue({ channelCount }, { emitEvent: false });
    });
  }

  onSubmit() {
    if (this.subscriptionForm.valid) {
      this.addSubscription();
    } else {
      this.subscriptionForm.markAllAsTouched(); // Marquer tous les champs comme "touchés" pour afficher les erreurs
    }
  }

  private addSubscription() {
    const now = new Date();
    const formattedDate = now.toISOString().split('.')[0] + 'Z'; // Format ISO sans millisecondes

    const formValues = this.subscriptionForm.value;
    const newSubscription: TypeNewSubscription = {
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
    this.toastr.success(
      `L'abonnement <span class="msg-class">${newSubscription.subscriptionType} de ${newSubscription.fullname}</span> ajouté avec succès`
    );
    this.redirectAtList(); // Redirection après succès
  }

  redirectAtList() {
    this.router.navigate(['/dashboard/subscriptions/list']); // Retour à la liste
  }
}
