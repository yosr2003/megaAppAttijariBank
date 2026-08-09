package org.example.backendyosrmegaapp.Controllers;


import lombok.RequiredArgsConstructor;
import org.example.backendyosrmegaapp.Enum.TwoFactorMethod;
import org.example.backendyosrmegaapp.JWT.JwtUtils;
import org.example.backendyosrmegaapp.Repositories.UserRepository;
import org.example.backendyosrmegaapp.Services.OtpService;
import org.example.backendyosrmegaapp.entities.JwtResponse;
import org.example.backendyosrmegaapp.entities.User;
import org.example.backendyosrmegaapp.entities.UserDetailsImpl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;


import java.time.LocalDateTime;
import java.util.Map;


@RestController
@RequestMapping("/api/2fa")
@RequiredArgsConstructor
public class TwoFactorController {

    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;

    private final OtpService otpService;



    @PostMapping("/generate")
    public ResponseEntity<?> generate(
            @RequestParam Long userId
    ){


        User user =
                userRepository.findById(userId)
                        .orElseThrow();



        String otp =
                otpService.generateOtp(user);



        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "OTP generated",
                        "code",
                        otp
                )
        );

    }



    @PostMapping("/verify")
    public ResponseEntity<?> verifyOTP(

            @RequestParam Long userId,

            @RequestParam String code

    ){


        // Récupérer utilisateur

        User user =
                userRepository.findById(userId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Utilisateur introuvable"
                                )
                        );



        // Vérification OTP

        boolean valid =
                otpService.verifyOtp(
                        user,
                        code
                );



        if(!valid){

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    "OTP invalide ou expiré"
                            )
                    );
        }



        /*
          OTP correct
          Maintenant on crée une authentification
          pour générer le JWT
        */


        UserDetailsImpl userDetails =
                UserDetailsImpl.build(user);



        Authentication authentication =
                new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );



        SecurityContextHolder
                .getContext()
                .setAuthentication(authentication);



        String jwt =
                jwtUtils.generateJwtToken(
                        authentication
                );



        return ResponseEntity.ok(

                new JwtResponse(

                        jwt,

                        user.getId(),

                        user.getFirstName(),

                        user.getLastName(),

                        user.getEmail(),

                        user.getUserType().name(),
                        user.getProfileImage()

                )

        );
    }
    @PostMapping("/enable")
    public ResponseEntity<?> enable2FA(

            @RequestParam Long userId,

            @RequestParam TwoFactorMethod method

    ){


        User user =
                userRepository.findById(userId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Utilisateur introuvable"
                                )
                        );



        user.setTwoFactorEnabled(true);


        user.setTwoFactorMethod(method);


        user.setTwoFactorActivatedAt(
                LocalDateTime.now()
        );



        userRepository.save(user);



        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "2FA activée avec succès",

                        "method",
                        method.name()
                )
        );

    }


}
