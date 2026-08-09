package org.example.backendyosrmegaapp.Controllers;


import lombok.RequiredArgsConstructor;
import org.example.backendyosrmegaapp.JWT.JwtUtils;
import org.example.backendyosrmegaapp.Services.FaceService;
import org.example.backendyosrmegaapp.entities.FaceRegistrationResponse;
import org.example.backendyosrmegaapp.entities.JwtResponse;
import org.example.backendyosrmegaapp.entities.User;
import org.example.backendyosrmegaapp.entities.UserDetailsImpl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


@RestController
@RequestMapping("/api/faces")
@RequiredArgsConstructor
public class FaceController {


    private final FaceService faceService;
    private final JwtUtils jwtUtils;


    @PostMapping("/register")
    public ResponseEntity<?> registerFace(

            @RequestParam Long userId,
            @RequestParam MultipartFile image

    ) throws Exception {


        faceService.registerFace(userId,image);


        return ResponseEntity.ok(
                new FaceRegistrationResponse(
                        true,
                        "Face registered successfully"
                )
        );
    }



    @PostMapping("/test-face")
    public ResponseEntity<?> testFace(
            @RequestParam("image") MultipartFile image
    ) throws Exception {


        String result =
                faceService.extractEmbedding(image);


        return ResponseEntity.ok(result);
    }



    // ==============================
    // LOGIN AVEC RECONNAISSANCE FACIALE
    // ==============================

    @PostMapping("/login")
    public ResponseEntity<?> loginFace(

            @RequestParam("image") MultipartFile image

    ) throws Exception {


        // 1 - Reconnaissance du visage
        User user =
                faceService.authenticate(image);



        if(user == null){

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Visage non reconnu"
                    );
        }



        // 2 - Transformer User en UserDetails
        UserDetailsImpl userDetails =
                UserDetailsImpl.build(user);



        // 3 - Créer une Authentication temporaire
        Authentication authentication =
                new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );



        // 4 - Générer JWT
        String jwt =
                jwtUtils.generateJwtToken(authentication);



        // 5 - Retourner la réponse habituelle
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

}