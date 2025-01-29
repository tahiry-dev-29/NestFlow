import uuid
import random
import json
from datetime import datetime, timedelta
from tqdm import tqdm

def random_date(start_year, end_year):
    """Génère une date aléatoire entre deux années."""
    start_date = datetime(start_year, 1, 1)
    end_date = datetime(end_year, 12, 31)
    random_days = random.randint(0, (end_date - start_date).days)
    return start_date + timedelta(days=random_days)

def calculate_end_date(start_date, duration, time_unit):
    """Calcule la date de fin en fonction de la durée et de l'unité de temps."""
    if time_unit == "WEEKS":
        return start_date + timedelta(weeks=duration)
    elif time_unit == "MONTHS":
        return start_date + timedelta(weeks=4 * duration)  # Approximation
    else:
        raise ValueError("Unsupported time unit")

def map_subscription_to_status_response(subscription):
    """Mappe un abonnement à sa réponse d'état avec calcul de la progression et statut."""
    start_date = subscription['subscriptionStartDate']
    duration = subscription['duration']
    time_unit = subscription['timeUnit']
    
    # Calcul de la date de fin
    end_date = calculate_end_date(start_date, duration, time_unit)
    
    # Calcul des jours totaux, restants et écoulés
    total_days = (end_date - start_date).days
    now = datetime.now()
    
    remaining_days = (end_date - now).days
    elapsed_days = (now - start_date).days
    
    # Calcul du pourcentage de progression (logique cyclique)
    progress_percentage = (elapsed_days % total_days) / total_days * 100 if total_days > 0 else 100.0
    
    # Si la progression est supérieure à 10%, statut actif, sinon expiré
    status = "ACTIVE" if progress_percentage > 10 else "EXPIRED"
    
    # Retourner la réponse avec les informations de progression
    return {
        "remainingDays": remaining_days,
        "progressPercentage": 100.0 - progress_percentage,
        "isExpired": remaining_days <= 0,
        "status": status
    }

def generate_restricted_duration_subscriptions(n=389):
    """Génère des abonnements avec une durée entre 4 et 6 semaines et des informations détaillées."""
    subscriptions = []
    for i in tqdm(range(n), desc="Generating subscriptions", unit="subscription"):
        start_date = random_date(2023, 2025)
        
        # Durée entre 4 et 6 semaines
        duration = random.randint(4, 6)  # Durée limitée entre 4 et 6 semaines
        time_unit = "WEEKS"
        
        # Calcul de la date de fin
        end_date = calculate_end_date(start_date, duration, time_unit)
        
        # Définition du type d'abonnement et prix en fonction du type
        subscription_type = random.choice(["BASIC", "CLASSIC"])  # Exclu "PREMIUM"
        if subscription_type == "BASIC":
            channel_count = 250
            price = 30000
        else:  # CLASSIC
            channel_count = 500
            price = 50000

        # Génération des informations d'abonnement
        subscription = {
            "_id": str(uuid.uuid4()),
            "fullname": f"User {i+1}",
            "email": f"user{i+1}@example.com",
            "tel": f"{random.randint(1000000000, 9999999999)}",
            "adresse": f"Address {i+1}",
            "code": "$2a$12$NJ53CPndRJagDRT1hIMxz.khtWFXWP7piOlU4cqr8ezVQXNc97mLy",
            "channelCount": channel_count,
            "subscriptionType": subscription_type,
            "subscriptionStartDate": start_date,
            "subscriptionEndDate": end_date,
            "duration": duration,
            "timeUnit": time_unit,
            "price": str(price),
            "_class": "com.nestflow.app.features.subscriptionDetails.model.SubscriptionDetailsEntity"
        }
        
        # Mapper l'abonnement pour ajouter le statut et la progression
        status_response = map_subscription_to_status_response(subscription)
        subscription.update(status_response)
        
        subscriptions.append(subscription)
    
    return subscriptions

# Fonction pour sérialiser les objets datetime en ISO format
def json_serial(obj):
    """Convertit les objets datetime en format ISO 8601."""
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError("Type not serializable")

# Génération des abonnements
subscriptions = generate_restricted_duration_subscriptions()

# Enregistrement dans un fichier JSON
output_path = "restricted_duration_subscriptions_with_status.json"
with open(output_path, "w") as file:
    json.dump(subscriptions, file, indent=4, default=json_serial)

print(f"Les données ont été générées et enregistrées dans {output_path}")
