package org.example.backendyosrmegaapp.entities;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;
import org.antlr.v4.runtime.misc.NotNull;
import org.example.backendyosrmegaapp.Enum.UserType;


import java.time.LocalDate;

@Getter
@Setter
public class SignupRequest {

    // Choix du type d'utilisateur
    @NotNull
    private UserType userType;

    // Informations communes
    @NotBlank
    @Size(min = 2, max = 30)
    private String firstName;

    @NotBlank
    @Size(min = 2, max = 30)
    private String lastName;

    @NotBlank
    @Pattern(regexp = "\\d{8}", message = "Le CIN doit contenir exactement 8 chiffres")
    private String cin;

    @NotNull
    private LocalDate dateOfBirth;

    @NotBlank
    private String gender;

    @NotBlank
    @Pattern(regexp = "\\d{8}", message = "Le numéro de téléphone doit contenir exactement 8 chiffres")
    private String phoneNumber;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 8, max = 100)
    private String password;

    private String profileImage;

    // ==========================
    // Champs Client
    // ==========================

    private String preferredLanguage;

    private String address;

    private String walletCurrency;

    private String paymentMethod;

    private String emergencyContact;

    // ==========================
    // Champs Admin
    // ==========================

    private String department;

    private String accessLevel;

    private String authorizationDocument;
}
