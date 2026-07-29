package org.example.backendyosrmegaapp.Services;

import org.example.backendyosrmegaapp.entities.User;

public interface OtpService {


    String generateOtp(User user);



    boolean verifyOtp(
            User user,
            String code
    );


}
