package org.example.backendyosrmegaapp.ServicesImpl;


import lombok.RequiredArgsConstructor;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class EmailServiceImpl {


    private final JavaMailSender mailSender;



    public void sendOtpEmail(
            String email,
            String otp
    ){

        SimpleMailMessage message =
                new SimpleMailMessage();


        message.setFrom(
                "Yosr.amamou@yahoo.com"
        );


        message.setTo(email);


        message.setSubject(
                "SuperTounsi - Verification Code"
        );


        message.setText(
                "Hello,\n\n"
                        +
                        "Your SuperTounsi verification code is : "
                        +
                        otp
                        +
                        "\n\nThis code expires in 5 minutes."
        );


        mailSender.send(message);

    }

}