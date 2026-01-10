package com.Sriram.Part_Time_jobProtal.Exception;
//Client sent wrong input.
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
