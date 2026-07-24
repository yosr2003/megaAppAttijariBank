package org.example.backendyosrmegaapp.Controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.backendyosrmegaapp.Repositories.UserRepository;
import org.example.backendyosrmegaapp.Services.UserService;
import org.example.backendyosrmegaapp.entities.PasswordUpdateRequest;
import org.example.backendyosrmegaapp.entities.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Envoi d'un email de réinitialisation
     */
//    @PostMapping("/forgot-password")
//    public ResponseEntity<String> forgotPassword(@RequestParam String email) {
//
//        userService.sendPasswordResetEmail(email);
//
//        return ResponseEntity.ok("Password reset email sent successfully.");
//    }

    /**
     * Réinitialisation via token reçu par email
     */
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(
            @RequestParam String token,
            @RequestParam String newPassword) {

        userService.resetPassword(token, newPassword);

        return ResponseEntity.ok("Password has been reset successfully.");
    }

    /**
     * Modification du mot de passe d'un utilisateur connecté
     */
    @PostMapping("/update-password")
    public ResponseEntity<?> updatePassword(
            @Valid @RequestBody PasswordUpdateRequest request) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found."));

        if (!passwordEncoder.matches(
                request.getCurrentPassword(),
                user.getPassword())) {

            return ResponseEntity.badRequest()
                    .body("Current password is incorrect.");
        }

        if (!request.getNewPassword()
                .equals(request.getConfirmPassword())) {

            return ResponseEntity.badRequest()
                    .body("New password and confirmation do not match.");
        }

        user.setPassword(
                passwordEncoder.encode(request.getNewPassword())
        );

        userRepository.save(user);

        return ResponseEntity.ok("Password updated successfully.");
    }

}