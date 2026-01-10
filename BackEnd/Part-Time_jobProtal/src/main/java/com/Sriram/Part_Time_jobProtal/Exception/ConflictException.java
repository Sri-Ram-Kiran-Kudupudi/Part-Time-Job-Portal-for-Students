package com.Sriram.Part_Time_jobProtal.Exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

//Request is logically valid, But business rule conflict occurs.
@ResponseStatus(HttpStatus.CONFLICT) // 409
public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}
