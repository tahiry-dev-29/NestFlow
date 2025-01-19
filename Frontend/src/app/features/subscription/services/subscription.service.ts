import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';
import { SubscriptionDetails } from '../models/subscription.model';
import { SubscriptionWithDetails } from '../models/subscription.interface';

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
        return this.http.get<SubscriptionWithDetails[]>(`${this.baseUrl}/getAll/withDetails`); // Plus besoin des headers ni de withCredentials
    }

    // Delete Subscription
    DeleteSubscription(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/delete/${id}`);
    }

    // Edit Subscription
    EditSubscription(id: string, subscription: SubscriptionDetails): Observable<SubscriptionDetails> {
        return this.http.put<SubscriptionDetails>(`${this.baseUrl}/edit/${id}`, subscription);
    }

    // Add Subscription
    AddSubscription(subscription: SubscriptionDetails): Observable<SubscriptionDetails> {
        return this.http.post<SubscriptionDetails>(`${this.baseUrl}/add`, subscription);
    }
}