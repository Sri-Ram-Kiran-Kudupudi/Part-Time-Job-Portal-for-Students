package com.Sriram.Part_Time_jobProtal.Exception;

//Used when something requested does NOT exist.
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
