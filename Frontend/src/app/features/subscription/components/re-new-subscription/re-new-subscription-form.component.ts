import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import {ERROR_MESSAGES_FORM, errorMessages} from '../../../../../constantes';
import { RenewSubscriptionData } from '../../interfaces/subscription.interface';
import { SubscriptionType, TimeUnit } from '../../models/subscription.model';
import { MAX_CHANNEL_COUNT, MAX_DURATION, SubscriptionCalculator } from '../../utils/subscription.constant';
import { SubscriptionStore } from '../../store/store';

@Component({
    selector: 'app-renew-subscription-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <form [formGroup]="renewForm" (ngSubmit)="onSubmit()" class="space-y-4 p-2">
      <div class="grid grid-cols-2 gap-4 gap-y-6">
        <div class="space-y-2">
          <label class="label-theme">Subscription type</label>
          <select formControlName="subscriptionType" class="input-theme w-full">
            <option [value]="SubscriptionType.BASIC">Basic</option>
            <option [value]="SubscriptionType.CLASSIC">Classic</option>
          </select>
          @if (renewForm.get('subscriptionType')?.invalid && renewForm.get('subscriptionType')?.touched) {
            <div class="error">
              <small *ngFor="let error of getErrors('subscriptionType')">{{ error }}</small>
            </div>
          }
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-2">
            <label class="label-theme">Duration</label>
            <input
              type="number"
              formControlName="duration"
              class="input-theme w-full"
              min="1"
              placeholder="Duration"
            />
          </div>
          <div class="space-y-2">
            <label class="label-theme">Unit</label>
            <select formControlName="timeUnit" class="input-theme w-full">
              <option [value]="TimeUnit.DAYS">Days</option>
              <option [value]="TimeUnit.WEEKS">Weeks</option>
              <option [value]="TimeUnit.MONTHS">Months</option>
              <option [value]="TimeUnit.YEARS">Years</option>
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
              placeholder="Number of channels"
            />
            <input
              type="text"
              [value]="displayedPrice()"
              class="input-theme bg-gray-700/50"
              readonly
              placeholder="Price"
            />
          </div>
          <div class="text-sm mt-3 px-3 text-gradient ">
            Calculated price for {{ renewForm.get('duration')?.value || 0 }}
            {{ getTimeUnitLabel(renewForm.get('timeUnit')?.value || TimeUnit.MONTHS) }}
          </div>
        </div>
      </div>

      <div class="flex justify-end space-x-3 mt-6 border-t border-gray-700">
        <button
          type="button"
          (click)="OnClose()"
          class="cancel-btn px-4 py-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          [disabled]="!renewForm.valid || isSubmitting()"
          class="w-24 px-4 py-2 flex justify-center items-center"
          [ngClass]="{'btn-desactived-bg': !renewForm.valid, 'btn-gradient-bg': renewForm.valid}"
        >
          {{ isSubmitting() ? 'Renewing...' : 'Renew' }}
        </button>
      </div>
    </form>
  `,
  styleUrl: './re-new-subscription.component.scss'
})
export class RenewSubscriptionFormComponent {
    subscriberId = input<string>();
    close = output();
    submit = output<RenewSubscriptionData>();

    private fb = inject(FormBuilder);
    private toaster = inject(ToastrService);

    SubscriptionType = SubscriptionType;
    TimeUnit = TimeUnit;

    private _isSubmitting = signal(false);
    isSubmitting = computed(() => this._isSubmitting());

    private _displayedChannelCount = signal(0);
    displayedChannelCount = computed(() => this._displayedChannelCount());

    private _displayedPrice = signal(0);
    displayedPrice = computed(() => this._displayedPrice());

    private readonly store = inject(SubscriptionStore);
    private readonly toast = inject(ToastrService);

    renewForm = this.fb.group({
        subscriptionType: [SubscriptionType.BASIC, [Validators.required]],
        duration: [1, [Validators.required, Validators.min(1), Validators.max(MAX_DURATION[TimeUnit.MONTHS])]],
        timeUnit: [TimeUnit.MONTHS, [Validators.required]],
        channelCount: [MAX_CHANNEL_COUNT[SubscriptionType.BASIC], [Validators.required, Validators.min(1)]]
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
            case TimeUnit.DAYS: return 'day(s)';
            case TimeUnit.WEEKS: return 'week(s)';
            case TimeUnit.MONTHS: return 'month(s)';
            case TimeUnit.YEARS: return 'year(s)';
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
      debugger;
        if (this.renewForm.valid) {
            this._isSubmitting.set(true);
            const formValue = this.renewForm.value;

            const submitData: RenewSubscriptionData = {
                id: this.subscriberId() || '',
                subscriptionType: formValue.subscriptionType || SubscriptionType.BASIC,
                renewalPeriod: formValue.duration || 0,
                unit: formValue.timeUnit || TimeUnit.MONTHS,
                channelCount: formValue.channelCount || 0,
            };

            this.submit.emit(submitData);
            this._isSubmitting.set(false);
            this.store.reNewSubscription(submitData);
            this.toast.success(`<span class="msg-class">${submitData.unit}</span> Subscription renewed successfully`);
            this.close.emit();
        } else {
            this.toaster.error(ERROR_MESSAGES_FORM.VALIDATION_ERROR);
            this.renewForm.markAllAsTouched();
        }
    }

    OnClose(){
      this.close.emit()
    }
}
