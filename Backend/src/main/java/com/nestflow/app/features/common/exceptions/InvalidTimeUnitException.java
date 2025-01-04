package com.nestflow.app.features.common.exceptions;

public class InvalidTimeUnitException extends RuntimeException {

    public InvalidTimeUnitException(String message) {
        super(message);
    }

    public InvalidTimeUnitException(String message, Throwable cause) {
        super(message, cause);
    }
}
