src/
  app/
    features/
      subscription/
        components/
          subscribe.component.ts      # Composant pour l'inscription à un abonnement
          subscription-details.component.ts  # Composant pour afficher les détails de l'abonnement
        services/
          subscription.service.ts    # Service pour la gestion des abonnements
        models/
          subscription.model.ts      # Modèle représentant un abonnement
        pages/
          subscribe-page.component.ts  # Page d'inscription à un abonnement
          subscription-overview.component.ts # Vue d'ensemble des abonnements
      users/
        components/
          user-list.component.ts     # Liste des utilisateurs abonnés
          user-detail.component.ts   # Détails d'un utilisateur
        services/
          user.service.ts            # Service pour gérer les utilisateurs
        models/
          user.model.ts              # Modèle représentant un utilisateur
        pages/
          user-list-page.component.ts # Page affichant la liste des utilisateurs
          user-detail-page.component.ts # Page pour afficher les détails d'un utilisateur
      payments/
        components/
          payment-form.component.ts  # Composant pour saisir les informations de paiement
        services/
          payment.service.ts        # Service pour traiter les paiements
        models/
          payment.model.ts          # Modèle représentant une transaction de paiement
        pages/
          payment-page.component.ts # Page pour effectuer un paiement
      plans/
        components/
          plan-list.component.ts    # Liste des plans d'abonnement
        services/
          plan.service.ts           # Service pour gérer les différents plans d'abonnement
        models/
          plan.model.ts             # Modèle représentant un plan d'abonnement
        pages/
          plan-list-page.component.ts # Page affichant les différents plans
    shared/
      components/
        header.component.ts         # Composant partagé pour l'en-tête
        footer.component.ts         # Composant partagé pour le pied de page
      directives/
        highlight.directive.ts      # Directive partagée
      pipes/
        currency.pipe.ts            # Pipe pour formater les prix
    core/
      services/
        config.service.ts           # Service de configuration global
        data.service.ts             # Service pour gérer les données partagées
        notification.service.ts     # Service de notification
      interceptors/
        error.interceptor.ts        # Intercepteur pour gérer les erreurs HTTP
      helpers/
        utils.ts                    # Fonctions utilitaires
      enums/
        subscriptionStatus.enum.ts  # Enum pour gérer les statuts d'abonnement
    layouts/
      default-layout.component.ts   # Mise en page par défaut
    app.module.ts                    # Module principal de l'application
    app.component.ts                 # Composant principal de l'application
  assets/                             # Ressources statiques (images, icônes, etc.)
  environments/                       # Environnements (dev, prod, etc.)

  Revenir a la dernier commit
  -> git reset --hard HEAD