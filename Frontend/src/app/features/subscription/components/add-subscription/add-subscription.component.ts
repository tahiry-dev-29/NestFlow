import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { errorMessages } from '../../../../../constantes';
import { SubscriptionType, TimeUnit } from '../../models/subscription.model';
import { SubscriptionStore } from '../../store/store';
import {
  MAX_CHANNEL_COUNT,
  MAX_DURATION,
  SUBSCRIPTION_CONFIG,
  SubscriptionCalculator,
} from '../../utils/subscription.constant';
import { AddSubscription } from '../../interfaces/subscription.interface';
import { Router } from '@angular/router';

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
  private toastr = inject(ToastrService);
  private router = inject(Router);

  SubscriptionType = SubscriptionType;
  TimeUnit = TimeUnit;

  displayedChannelCount: number = 0;
  displayedPrice: number = 0;

  subscriptionForm = this.fb.group({
    fullname: [
      '',
      [Validators.required, Validators.minLength(5), Validators.maxLength(100)],
    ],
    email: ['', [Validators.required, Validators.email]],
    tel: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    adresse: [
      '',
      [Validators.required, Validators.minLength(5), Validators.maxLength(100)],
    ],
    code: ['', [Validators.required, Validators.minLength(4)]],
    subscriptionType: [SubscriptionType.BASIC, [Validators.required]],
    duration: [
      1,
      [
        Validators.required,
        Validators.min(1),
        Validators.max(MAX_DURATION[TimeUnit.MONTHS]),
      ],
    ],
    timeUnit: [TimeUnit.MONTHS, [Validators.required]],
    channelCount: [
      MAX_CHANNEL_COUNT[SubscriptionType.BASIC],
      [Validators.required, Validators.min(1)],
    ],
    price: [SUBSCRIPTION_CONFIG.BASIC.basePrice, [Validators.required]],
  });

  getInitialValues() {
    this.subscriptionForm.patchValue({
      subscriptionType: SubscriptionType.BASIC,
      duration: 1,
      timeUnit: TimeUnit.MONTHS,
    });
  }

  ngOnInit() {
    this.subscriptionForm.valueChanges.subscribe(() => {
      this.updateDisplayedValues();
    });
    this.updateDisplayedValues();
  }

  private updateDisplayedValues() {
    const type = this.subscriptionForm.get('subscriptionType')
      ?.value as SubscriptionType;
    const duration = this.subscriptionForm.get('duration')?.value || 1;
    const timeUnit = this.subscriptionForm.get('timeUnit')?.value as TimeUnit;

    const calculator = new SubscriptionCalculator(type, duration, timeUnit);

    this.displayedChannelCount = calculator.getChannelCount();
    this.displayedPrice = calculator.calculateTotalPrice();
  }

  getTimeUnitLabel(unit: TimeUnit | null): string {
    switch (unit) {
      case TimeUnit.DAYS:
        return 'jour(s)';
      case TimeUnit.WEEKS:
        return 'semaine(s)';
      case TimeUnit.MONTHS:
        return 'mois';
      case TimeUnit.YEARS:
        return 'année(s)';
      default:
        return '';
    }
  }

  getErrors(controlName: string): string[] {
    const control = this.subscriptionForm.get(controlName);
    if (control && control.invalid && control.touched) {
      return Object.keys(control.errors || {}).map(
        (errorName) =>
          errorMessages[controlName][errorName] || 'Erreur inconnue'
      );
    }
    return [];
  }

  onSubmit() {
    if (this.subscriptionForm.valid) {
      const formValues = this.subscriptionForm.value;
      const subscription: AddSubscription = {
        fullname: formValues.fullname!,
        email: formValues.email!,
        tel: formValues.tel!,
        adresse: formValues.adresse!,
        code: formValues.code!,
        subscriptionType: formValues.subscriptionType as SubscriptionType,

        channelCount: this.displayedChannelCount,
        price: this.displayedPrice,
        duration: formValues.duration!,
        timeUnit: formValues.timeUnit!,
      };

      this.store.addSubscription(subscription);

      this.toastr.success(
        `<span class="msg-class">${subscription.fullname}</span> subscription added successfully!`
      );
      setTimeout(
        () => {
          this.store.LoadSubscriptionWithDetails(
            this.store.subscriptionsWithDetails()
          );
          this.subscriptionForm.reset({
            subscriptionType: SubscriptionType.BASIC,
            duration: 1,
            timeUnit: TimeUnit.MONTHS,
            price: SUBSCRIPTION_CONFIG.BASIC.basePrice,
          });
        },
        this.store.loading() === false ? 1000 : 0
      );
    } else {
      this.toastr.error('The form is invalid.');
      this.subscriptionForm.markAllAsTouched();
    }
  }
  redirectToList() {
    this.router.navigate(['dashboard/subscriptions/list']);
  }
}
