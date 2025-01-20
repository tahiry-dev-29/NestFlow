import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SubscriptionDetails } from '../models/subscription.model';
import { AddSubscription, EditSubscription, ReNewSubscription, SubscriptionWithDetails } from '../interfaces/subscription.interface';

@Injectable({
    providedIn: 'root'
})
export class SubscriptionService {

    private readonly baseUrl = environment.apiUrl + '/subscriptions';
    private readonly http = inject(HttpClient);

    // Get All Subscriptions
    getListsSubscriptions(): Observable<SubscriptionDetails[]> {
        return this.http.get<SubscriptionDetails[]>(`${this.baseUrl}/lists`);
    }


    // Get Status Subscriptions
    getStatusSubscriptions(): Observable<SubscriptionWithDetails[]> {
        return this.http.get<SubscriptionWithDetails[]>(`${this.baseUrl}/getAll/withDetails`);
    }

    // Delete Subscription
    DeleteSubscription(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/delete/${id}`);
    }

    // Edit Subscription
    EditSubscription(id: string, subscription: EditSubscription): Observable<EditSubscription> {
        return this.http.put<EditSubscription>(`${this.baseUrl}/update/${id}`, subscription);
    }

    // Add Subscription
    AddSubscription(subscription: AddSubscription): Observable<SubscriptionDetails> {
        return this.http.post<SubscriptionDetails>(`${this.baseUrl}/add`, subscription);
    }

    // Re New Subscription
    ReNewSubscription(id: string, subscription: ReNewSubscription): Observable<SubscriptionDetails> {
        return this.http.patch<SubscriptionDetails>(`${this.baseUrl}/${id}/renew`, subscription);
    }
}