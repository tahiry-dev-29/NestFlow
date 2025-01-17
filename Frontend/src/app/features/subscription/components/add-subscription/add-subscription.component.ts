import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SubscriptionType } from '../../models/subscription.model';
import { SubscriptionStore } from '../../store/store';
import { AddSubscription } from '../interfaces/subscription.interface';
import { SubscriptionCalculator } from '../../utils/subscription.constant';
import { TimeUnit } from '../../models/subscription.interface';
import { errorMessages } from '../../../../../constantes';


@Component({
    selector: 'app-add-subscription',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './add-subscription.component.html',
    styleUrls: ['./add-subscription.component.scss']
})
export class AddSubscriptionComponent implements OnInit {
    private fb = inject(FormBuilder);
    private store = inject(SubscriptionStore);
    private router = inject(Router);
    private toastr = inject(ToastrService);

    SubscriptionType = SubscriptionType;
    TimeUnit = TimeUnit;

    displayedChannelCount: number = 0;
    displayedPrice: number = 0;

    subscriptionForm = this.fb.group({
        fullname: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
        email: ['', [Validators.required, Validators.email]],
        tel: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
        adresse: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
        code: ['', [Validators.required, Validators.minLength(4)]],
        subscriptionType: [SubscriptionType.BASIC, [Validators.required]],
        duration: [1, [Validators.required, Validators.min(1)]],
        timeUnit: [TimeUnit.MONTHS, [Validators.required]]
    });

    ngOnInit() {
        this.subscriptionForm.valueChanges.subscribe(() => {
            this.updateDisplayedValues();
        });

        this.updateDisplayedValues();
    }

    private updateDisplayedValues() {
        const type = this.subscriptionForm.get('subscriptionType')?.value as SubscriptionType;
        const duration = this.subscriptionForm.get('duration')?.value || 1;
        const timeUnit = this.subscriptionForm.get('timeUnit')?.value as TimeUnit;

        const calculator = new SubscriptionCalculator(
            type,
            duration,
            timeUnit
        );

        this.displayedChannelCount = calculator.getChannelCount();
        this.displayedPrice = calculator.calculateTotalPrice();
    }

    getTimeUnitLabel(unit: TimeUnit | null): string {
        switch (unit) {
            case TimeUnit.DAYS: return 'jour(s)';
            case TimeUnit.WEEKS: return 'semaine(s)';
            case TimeUnit.MONTHS: return 'mois';
            case TimeUnit.YEARS: return 'année(s)';
            default: return '';
        }
    }

    getErrors(controlName: string): string[] {
        const control = this.subscriptionForm.get(controlName);
        if (control && control.invalid && control.touched) {
            return Object.keys(control.errors || {}).map(errorName => errorMessages[controlName][errorName] || 'Erreur inconnue');
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
                subscriptionType: formValues.subscriptionType as SubscriptionType
            };

            this.store.addSubscription(subscription);
            this.toastr.success(`Abonnement ${subscription.subscriptionType} ajouté avec succès!`);
            this.redirectToList();
        } else {
            this.toastr.error('Le formulaire est invalide.');
            this.subscriptionForm.markAllAsTouched();
        }
    }

    redirectToList() {
        this.router.navigate(['dashboard/subscriptions/list']);
    }
}