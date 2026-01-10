package com.Sriram.Part_Time_jobProtal.Util;

import java.util.Random;

public class OtpUtil {

    public static String generateOtp() {
        return String.valueOf(100000 + new Random().nextInt(900000));
    }
}


//100000 + if random= 899999 = 999999