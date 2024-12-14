import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SubscriptionStore } from '../../store/subscribed.store';

@Component({
  selector: 'app-edit-subscrition',
  templateUrl: './edit-subscrition.component.html',
  styleUrl: './edit-subscrition.component.scss',
  standalone: true,
  imports: [CommonModule],
})
export class EditSubscriptionComponent {
  private fb = inject(FormBuilder);
  private store = inject(SubscriptionStore);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastr = inject(ToastrService);

  editForm = this.fb.group({
    fullname: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$')]],
    tel: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]], // 10 chiffres
    adresse: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
    subscriptionType: ['Basique', [Validators.required]],
    channelCount: [250, [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(4)]],
    active: [true],
    progress: [0],
  });

  
  ngOnInit() {
    this.loadSubscriptionData();
  }

  private getSubscriptionIdFromRoute(): number | null {
    const id = this.route.snapshot.paramMap.get('id');
    return id ? parseInt(id, 10) : null;
  }

  private loadSubscriptionData() {
    const subscriptionId = this.getSubscriptionIdFromRoute();
    if (!subscriptionId) {
      this.toastr.error('Identifiant de souscription invalide.');
      this.router.navigate(['/dashboard/subscriptions/list']);
      return;
    }

    const subscription = this.store.getSubscriptionById(subscriptionId);
    if (!subscription) {
      this.toastr.error('Souscription introuvable.');
      this.router.navigate(['/dashboard/subscriptions/list']);
      return;
    }

    this.editForm.patchValue(subscription);
  }

  onSubscriptionTypeChange() {
    const type = this.editForm.get('subscriptionType')?.value;
    const channelCount = type === 'Classique' ? 500 : 250;
    this.editForm.patchValue({ channelCount });
  }

  onSubmit() {
    if (this.editForm.valid) {
      const updatedSubscription = this.editForm.value;
      const subscriptionId = this.getSubscriptionIdFromRoute();

      // if (subscriptionId) {
      //   this.store.updateSubscription(subscriptionId, updatedSubscription);
      //   this.toastr.success('Souscription mise à jour avec succès !');
      //   this.router.navigate(['/dashboard/subscriptions/list']);
      // } else {
      //   this.toastr.error('Erreur lors de la mise à jour.');
      // }
    } else {
      this.editForm.markAllAsTouched();
    }
  }
}