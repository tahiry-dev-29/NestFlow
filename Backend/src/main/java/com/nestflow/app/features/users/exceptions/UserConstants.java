package com.nestflow.app.features.users.exceptions;

public class UserConstants {
     // Messages d'erreur
     public static final String ERROR_USER_NOT_FOUND = "Utilisateur non trouvé.";
     public static final String ERROR_INVALID_PASSWORD = "Mot de passe actuel incorrect.";
     public static final String ERROR_SERVER_ERROR = "Erreur interne du serveur.";
     public static final String ERROR_INVALID_PARAMETERS = "Paramètres de requête incorrects.";
     public static final String ERROR_UNAUTHORIZED_ACTION = "Action non autorisée.";
     public static final String SERVER_ERROR_MESSAGE = "Erreur interne du serveur.";
     // Messages de succès
     public static final String SUCCESS_USER_UPDATED = "Utilisateur mis à jour avec succès.";
     public static final String SUCCESS_PASSWORD_UPDATED = "Mot de passe mis à jour avec succès.";
     public static final String SUCCESS_IMAGE_UPDATED = "Image mise à jour avec succès.";
 
     // Divers
     public static final String DEFAULT_IMAGE_URL = "/images/default-profile.png";
     public static final String ROLE_ADMIN = "ADMIN";
     public static final String ROLE_USER = "USER";
 
     // Validation
     public static final String VALIDATION_NAME_REQUIRED = "Le nom est obligatoire.";
     public static final String VALIDATION_EMAIL_REQUIRED = "L'adresse email est obligatoire.";
     public static final String VALIDATION_EMAIL_INVALID = "L'adresse email doit être valide.";
     public static final String VALIDATION_PASSWORD_REQUIRED = "Le mot de passe est obligatoire.";
     public static final String VALIDATION_PASSWORD_LENGTH = "Le mot de passe doit contenir au moins 8 caractères.";
}
