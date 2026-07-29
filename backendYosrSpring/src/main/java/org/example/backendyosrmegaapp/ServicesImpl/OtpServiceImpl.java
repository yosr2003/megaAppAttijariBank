package org.example.backendyosrmegaapp.ServicesImpl;


import lombok.RequiredArgsConstructor;
import org.example.backendyosrmegaapp.Repositories.OtpCodeRepository;
import org.example.backendyosrmegaapp.Services.OtpService;
import org.example.backendyosrmegaapp.entities.OtpCode;
import org.example.backendyosrmegaapp.entities.User;
import org.springframework.stereotype.Service;


import java.time.LocalDateTime;
import java.util.Random;


@Service
@RequiredArgsConstructor
public class OtpServiceImpl implements OtpService {


    private final OtpCodeRepository otpRepository;



    @Override
    public String generateOtp(User user) {


        String code =
                String.valueOf(
                        new Random()
                                .nextInt(900000)
                                + 100000
                );



        OtpCode otp =
                OtpCode.builder()
                        .code(code)
                        .user(user)
                        .expirationTime(
                                LocalDateTime.now()
                                        .plusMinutes(5)
                        )
                        .verified(false)
                        .build();



        otpRepository.save(otp);



        return code;

    }





    @Override
    public boolean verifyOtp(
            User user,
            String code
    ) {


        return otpRepository
                .findByUserIdAndCode(
                        user.getId(),
                        code
                )
                .filter(
                        otp ->
                                otp.getExpirationTime()
                                        .isAfter(LocalDateTime.now())
                )
                .map(
                        otp -> {

                            otp.setVerified(true);

                            otpRepository.save(otp);

                            return true;

                        }
                )
                .orElse(false);

    }

}
