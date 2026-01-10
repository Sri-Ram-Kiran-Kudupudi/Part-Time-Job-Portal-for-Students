package com.Sriram.Part_Time_jobProtal.Exception;


//User is NOT allowed because: not logged in ,wrong pwd,token invalid,etc
public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}
