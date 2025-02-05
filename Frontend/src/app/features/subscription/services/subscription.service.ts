import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  AddSubscription,
  EditSubscription,
  RenewSubscriptionData,
  SubscriptionWithDetails,
} from '../interfaces/subscription.interface';
import { SubscriptionDetails } from '../models/subscription.model';
import { Cacheable } from 'ts-cacheable';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionService {
  private readonly baseUrl = environment.apiUrl + '/subscriptions';
  private readonly http = inject(HttpClient);

  // Get All Subscriptions
  @Cacheable()
  getListsSubscriptions(): Observable<SubscriptionDetails[]> {
    return this.http.get<SubscriptionDetails[]>(`${this.baseUrl}/lists`);
  }

  // Get Status Subscriptions
  @Cacheable()
  getStatusSubscriptions(): Observable<SubscriptionWithDetails[]> {
    return this.http.get<SubscriptionWithDetails[]>(
      `${this.baseUrl}/getAll/withDetails`
    );
  }

  // Delete Subscription
  @Cacheable()
  DeleteSubscription(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete/${id}`);
  }

  // Edit Subscription
  @Cacheable()
  EditSubscription(
    id: string,
    subscription: EditSubscription
  ): Observable<EditSubscription> {
    return this.http.put<EditSubscription>(
      `${this.baseUrl}/update/${id}`,
      subscription
    );
  }

  // Add Subscription
  @Cacheable()
  AddSubscription(
    subscription: AddSubscription
  ): Observable<SubscriptionDetails> {
    return this.http.post<SubscriptionDetails>(
      `${this.baseUrl}/add`,
      subscription
    );
  }

  // Re New Subscription
  @Cacheable()
  ReNewSubscription(
    id: string,
    subscription: RenewSubscriptionData
  ): Observable<RenewSubscriptionData> {
    return this.http.patch<RenewSubscriptionData>(
      `${this.baseUrl}/set/${id}/renew`,
      subscription
    );
  }
}
