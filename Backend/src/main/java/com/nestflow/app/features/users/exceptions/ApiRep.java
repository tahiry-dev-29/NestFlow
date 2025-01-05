package com.nestflow.app.features.users.exceptions;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ApiRep {
    private String message;
    private boolean success;
}
