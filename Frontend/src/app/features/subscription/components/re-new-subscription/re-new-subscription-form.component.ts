import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { errorMessages } from '../../../../../constantes';
import { RenewSubscriptionData } from '../../interfaces/subscription.interface';
import { SubscriptionType, TimeUnit } from '../../models/subscription.model';
import { SubscriptionCalculator } from '../../utils/subscription.constant';
import { DetailListsComponent } from '../detail-lists/detail-lists.component';

@Component({
    selector: 'app-renew-subscription-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <form [formGroup]="renewForm" (ngSubmit)="onSubmit()" class="space-y-4 p-2">
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-white">Type d'abonnement</label>
          <select formControlName="subscriptionType" class="input-theme w-full">
            <option [value]="SubscriptionType.BASIC">Basique</option>
            <option [value]="SubscriptionType.CLASSIC">Classique</option>
          </select>
          @if (renewForm.get('subscriptionType')?.invalid && renewForm.get('subscriptionType')?.touched) {
            <div class="error">
              <small *ngFor="let error of getErrors('subscriptionType')">{{ error }}</small>
            </div>
          }
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-white">Durée</label>
            <input 
              type="number" 
              formControlName="duration" 
              class="input-theme w-full" 
              min="1" 
              placeholder="Durée"
            />
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-medium text-white">Unité</label>
            <select formControlName="timeUnit" class="input-theme w-full">
              <option [value]="TimeUnit.DAYS">Jours</option>
              <option [value]="TimeUnit.WEEKS">Semaines</option>
              <option [value]="TimeUnit.MONTHS">Mois</option>
              <option [value]="TimeUnit.YEARS">Années</option>
            </select>
          </div>
          @if ((renewForm.get('duration')?.invalid && renewForm.get('duration')?.touched) || 
               (renewForm.get('timeUnit')?.invalid && renewForm.get('timeUnit')?.touched)) {
            <div class="error col-span-2">
              <small *ngFor="let error of getErrors('duration')">{{ error }}</small>
              <small *ngFor="let error of getErrors('timeUnit')">{{ error }}</small>
            </div>
          }
        </div>

        <div class="col-span-2">
          <div class="flex justify-between items-center gap-3">
            <input 
              type="text" 
              [value]="displayedChannelCount()" 
              class="input-theme bg-gray-700/50" 
              readonly 
              placeholder="Nombre de chaînes" 
            />
            <input 
              type="text" 
              [value]="displayedPrice()" 
              class="input-theme bg-gray-700/50" 
              readonly 
              placeholder="Prix" 
            />
          </div>
          <div class="text-gray-400 text-sm mt-1">
            Prix calculé pour {{ renewForm.get('duration')?.value || 0 }}
            {{ getTimeUnitLabel(renewForm.get('timeUnit')?.value || TimeUnit.MONTHS) }}
          </div>
        </div>
      </div>

      <div class="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          (click)="close()"
          class="cancel-btn px-4 py-2"
        >
          Annuler
        </button>
        <button
          type="submit"
          [disabled]="!renewForm.valid || isSubmitting()"
          class="w-24 px-4 py-2"
          [ngClass]="{'btn-desactived-bg': !renewForm.valid, 'btn-gradient-bg': renewForm.valid}"
        >
          {{ isSubmitting() ? 'En cours...' : 'Renouveler' }}
        </button>
      </div>
    </form>
  `,
    styles: [`
    .input-theme {
      @apply px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white w-full;
    }
    .error {
      @apply text-red-500 text-sm mt-1;
    }
  `]
})
export class RenewSubscriptionFormComponent {
    subscriberId = input<string>();
    close = input<void>();
    submit = output<RenewSubscriptionData>();

    private fb = inject(FormBuilder);
    private toastr = inject(ToastrService);

    SubscriptionType = SubscriptionType;
    TimeUnit = TimeUnit;

    private _isSubmitting = signal(false);
    isSubmitting = computed(() => this._isSubmitting());

    private _displayedChannelCount = signal(0);
    displayedChannelCount = computed(() => this._displayedChannelCount());

    private _displayedPrice = signal(0);
    displayedPrice = computed(() => this._displayedPrice());

    renewForm = this.fb.group({
        subscriptionType: [SubscriptionType.BASIC, [Validators.required]],
        duration: [1, [Validators.required, Validators.min(1)]],
        timeUnit: [TimeUnit.MONTHS, [Validators.required]]
    });

    constructor() {
        this.renewForm.valueChanges.subscribe(() => {
            this.updateDisplayedValues();
        });
        this.updateDisplayedValues();
    }

    private updateDisplayedValues() {
        const type = this.renewForm.get('subscriptionType')?.value as SubscriptionType;
        const duration = this.renewForm.get('duration')?.value || 1;
        const timeUnit = this.renewForm.get('timeUnit')?.value as TimeUnit;

        const calculator = new SubscriptionCalculator(type, duration, timeUnit);

        this._displayedChannelCount.set(calculator.getChannelCount());
        this._displayedPrice.set(calculator.calculateTotalPrice());
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
        const control = this.renewForm.get(controlName);
        if (control && control.invalid && control.touched) {
            return Object.keys(control.errors || {}).map(
                errorName => errorMessages[controlName][errorName] || 'Erreur inconnue'
            );
        }
        return [];
    }

    onSubmit(): void {
        if (this.renewForm.valid) {
            this._isSubmitting.set(true);
            const formValue = this.renewForm.value;

            const submitData: RenewSubscriptionData = {
                id: this.subscriberId() || '',
                renewalPeriod: 0,
                unit: TimeUnit.MONTHS,
                newType: SubscriptionType.BASIC,
            };

            this.submit.emit(submitData);
            this._isSubmitting.set(false);
        } else {
            this.toastr.error('Le formulaire est invalide.');
            this.renewForm.markAllAsTouched();
        }
    }

    /* onClose = inject(DetailListsComponent).showRenewPopup
    onCancel(): void {
        this.onClose()
    } */
}