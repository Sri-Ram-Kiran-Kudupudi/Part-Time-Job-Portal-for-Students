package com.Sriram.Part_Time_jobProtal.Exception;

//This is business specific, For your Part-Time Job Portal project.
public class AlreadyAppliedException extends RuntimeException {
    public AlreadyAppliedException(String message) {
        super(message);
    }
}