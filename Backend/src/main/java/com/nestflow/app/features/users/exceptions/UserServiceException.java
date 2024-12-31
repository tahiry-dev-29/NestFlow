package com.nestflow.app.features.users.exceptions;


public class UserServiceException extends RuntimeException { 

    public UserServiceException(String message) {
        super(message);
    }

    public static class UserAlreadyExistsException extends UserServiceException {
        public UserAlreadyExistsException(String message) {
            super(message);
        }
    }

    public static class InvalidPasswordException extends UserServiceException {
        public InvalidPasswordException(String message) {
            super(message);
        }
    }

    public static class InvalidUserException extends UserServiceException {
        public InvalidUserException(String message) {
            super(message);
        }
    }
}