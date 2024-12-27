package com.nestflow.app.features.subscriptionDetails.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "subscriptions")
public class SubscriptionDetails {
    @Id
    private String id;
    private String fullname;
    private String email;
    private String tel;
    private String adresse;
    private SubscriptionType subscriptionType;
    private int channelCount;
    private String subscriptionStartDate;
    private String subscriptionEndDate;
    private String deadline;
    private Double progress;
    private Status status;
    private String password;

    public enum SubscriptionType {
        Basique, Classique
    }
    public enum Status {
        active, expired
    }
}
