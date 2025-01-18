import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';
import { SubscriptionDetails } from '../models/subscription.model';

@Injectable({
    providedIn: 'root'
})
export class SubscriptionService {

    // base url
    private readonly baseUrl = environment.apiUrl + '/subscriptions';

    // injects
    private readonly authService = inject(AuthService);
    private readonly http = inject(HttpClient);

    // Get auth headers
    private getAuthHeaders(): HttpHeaders {
        const token = this.authService.getToken();
        return new HttpHeaders()
            .set('Authorization', `Bearer ${token}`)
            .set('Content-Type', 'application/json');
    }

    /* All methods for subscription */
    // Get All Subscriptions
    getListsSubscriptions(): Observable<SubscriptionDetails[]> {
        return this.http.get<SubscriptionDetails[]>(`${this.baseUrl}/lists`, {
            headers: this.getAuthHeaders(),
            withCredentials: true
        });
    }

    
    // Get Status Subscriptions
    getStatusSubscriptions(id: string): Observable<SubscriptionDetails[]> {
        return this.http.get<SubscriptionDetails[]>(`${this.baseUrl}/status/${id}`, {
            headers: this.getAuthHeaders(),
            withCredentials: true
        });
    }

    // Delete Subscription
    DeleteSubscription(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/delete/${id}`, {
            headers: this.getAuthHeaders(),
            withCredentials: true
        });
    }

    // Edit Subscription
    EditSubscription(id: string, subscription: SubscriptionDetails): Observable<SubscriptionDetails> {
        return this.http.put<SubscriptionDetails>(`${this.baseUrl}/edit/${id}`, subscription, {
            headers: this.getAuthHeaders(),
            withCredentials: true
        });
    }

    // Add Subscription
    AddSubscription(subscription: SubscriptionDetails): Observable<SubscriptionDetails> {
        return this.http.post<SubscriptionDetails>(`${this.baseUrl}/add`, subscription, {
            headers: this.getAuthHeaders(),
            withCredentials: true
        });
    }
}