package com.nestflow.app.features.common.exceptions;

public class UserServiceException extends RuntimeException {
    public UserServiceException(String message) {
        super(message);
    }

    public UserServiceException(String message, Throwable cause) {
        super(message, cause);
    }

    public static class UserAlreadyExistsException extends UserServiceException {
        public UserAlreadyExistsException(String email) {
            super("L'utilisateur avec l'email " + email + " existe déjà.");
        }
    }

    public static class UserNotFoundException extends UserServiceException {
        public UserNotFoundException(String userId) {
            super("L'utilisateur avec l'ID " + userId + " n'a pas été trouvé.");
        }

        public UserNotFoundException() {
            super("Utilisateur non trouvé.");
        }
    }

    public static class InvalidCredentialsException extends UserServiceException {
        public InvalidCredentialsException() {
            super("Email ou mot de passe invalide.");
        }
    }

    public static class PasswordMismatchException extends UserServiceException {
        public PasswordMismatchException() {
            super("Les mots de passe ne correspondent pas.");
        }
    }

    public static class CurrentPasswordIncorrectException extends UserServiceException {
        public CurrentPasswordIncorrectException() {
            super("Le mot de passe actuel est incorrect");
        }
    }
}
