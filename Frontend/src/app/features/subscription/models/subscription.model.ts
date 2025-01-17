export enum SubscriptionType {
  BASIC = 'BASIC',
  CLASSIC = 'CLASSIC',
}

export enum Status {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
}

export class SubscriptionDetails {
  id: string | undefined;
  fullname: string | undefined;
  email: string | undefined;
  tel: string | undefined;
  adresse: string | undefined;
  code!: string ;
  subscriptionType: SubscriptionType | undefined;
  channelCount: number | undefined;
  
  subscriptionStartDate: Date | undefined;
  subscriptionEndDate: Date | undefined;
  status: Status | undefined;
  price: number | undefined;
  remainingHours: number | undefined;
  remainingDays: number | undefined;
}

/* {
    "id": "14c93219-921c-46da-91fd-c94729c6b67c",
    "fullname": "Dean Ritchie",
    "email": "Vivian.Douglas@example.com",
    "tel": "452-577-0955",
    "adresse": "6398 Alta Summit",
    "code": "$2a$12$BwqPxhvIFKbRHCSDYP4Fk.8hCnRPq.2i0MApFJYJRsYaVSwn0ks0G",
    "subscriptionType": "BASIC",
    "channelCount": 250,
    "subscriptionStartDate": "2025-01-15T13:44:54.496",
    "subscriptionEndDate": "2025-02-15T13:44:54.496",
    "status": "ACTIVE",
    "price": 30000,
    "remainingHours": 742,
    "remainingDays": 30
}, */

/* { // add subscription
  "fullname": "{{$randomFullName}}",
  "email": "{{$randomExampleEmail}}",
  "tel": "{{$randomPhoneNumber}}", // Numéro de téléphone (facultatif)
  "adresse": "{{$randomStreetAddress}}", // Adresse (facultatif)
  "subscriptionType": "CLASSIC", // "CLASSIC" ou "BASIC"
  "code": "password" // Mot de passe EN CLAIR (sera haché par le serveur)
} */