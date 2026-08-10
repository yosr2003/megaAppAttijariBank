package org.example.backendyosrmegaapp.Controllers;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.example.backendyosrmegaapp.Enum.UserType;
import org.example.backendyosrmegaapp.JWT.JwtUtils;
import org.example.backendyosrmegaapp.Repositories.UserRepository;
import org.example.backendyosrmegaapp.Services.FileStorageService;
import org.example.backendyosrmegaapp.Services.OtpService;
import org.example.backendyosrmegaapp.Services.UserService;
import org.example.backendyosrmegaapp.entities.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/auth")
public class UserController {
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    FileStorageService fileStorageService;
    @Autowired
    OtpService otpService;
    @Autowired
    AuthenticationManager authenticationManager;
    @Autowired
    UserRepository userRepository;
    @Autowired
    UserService userService;
    @Autowired
    PasswordEncoder encoder;
    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {


        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                request.getEmail(),
                                request.getPassword()
                        )
                );


        SecurityContextHolder.getContext()
                .setAuthentication(authentication);



        UserDetailsImpl userDetails =
                (UserDetailsImpl) authentication.getPrincipal();


        User user =
                userRepository.findByEmail(
                                userDetails.getEmail()
                        )
                        .orElseThrow(
                                () -> new RuntimeException("User not found")
                        );


// ==============================
// Vérification 2FA
// ==============================

        if(Boolean.TRUE.equals(user.getTwoFactorEnabled())){


            String otp =
                    otpService.generateOtp(user);


            // TEMPORAIRE POUR TEST
            System.out.println(
                    "OTP = " + otp
            );


            return ResponseEntity.ok(
                    Map.of(
                            "status",
                            "OTP_REQUIRED",

                            "userId",
                            user.getId(),

                            "method",
                            user.getTwoFactorMethod()
                    )
            );

        }



// ==============================
// Pas de 2FA
// Génération JWT normale
// ==============================


        String jwt =
                jwtUtils.generateJwtToken(authentication);




        return ResponseEntity.ok(
                new JwtResponse(
                        jwt,
                        userDetails.getId(),
                        userDetails.getFirstName(),
                        userDetails.getLastName(),
                        userDetails.getEmail(),
                        userDetails.getRole(),
                        user.getProfileImage()
                )
        );

    }

    @PostMapping(
            value="/signup",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<?> registerUser(

            @RequestPart("user") String userJson,
            @RequestPart(value="image", required=false) MultipartFile image,
            @RequestPart(value="authorizationDocument", required=false) MultipartFile authorizationDocument

    ) throws IOException {

        SignupRequest request =
                objectMapper.readValue(userJson, SignupRequest.class);

        String imagePath = null;

        if(image != null && !image.isEmpty()){
            imagePath = fileStorageService.saveProfileImage(image);
        }

        String authorizationDocumentPath = null;

        if(authorizationDocument != null && !authorizationDocument.isEmpty()){
            authorizationDocumentPath =
                    fileStorageService.saveAuthorizationDocument(authorizationDocument);
        }

        // Vérification email
        if(userRepository.existsByEmail(request.getEmail())){
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Email already exists."));
        }

        // Vérification CIN
        if(userRepository.existsByCin(request.getCin())){
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("CIN already exists."));
        }

        // Vérification téléphone
        if(userRepository.existsByPhoneNumber(request.getPhoneNumber())){
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Phone number already exists."));
        }

        if(request.getUserType() == UserType.CLIENT){

            Client client = new Client();

            // Champs communs
            client.setFirstName(request.getFirstName());
            client.setLastName(request.getLastName());
            client.setCin(request.getCin());
            client.setDateOfBirth(request.getDateOfBirth());
            client.setGender(request.getGender());
            client.setPhoneNumber(request.getPhoneNumber());
            client.setEmail(request.getEmail());
            client.setPassword(encoder.encode(request.getPassword()));
            client.setProfileImage(imagePath);

            client.setEnabled(true);
            client.setEmailVerified(false);
            client.setPhoneVerified(false);
            client.setAccountLocked(false);

            // Champs Client
            client.setPreferredLanguage(request.getPreferredLanguage());
            client.setAddress(request.getAddress());
            client.setWalletCurrency(request.getWalletCurrency());
            client.setPaymentMethod(request.getPaymentMethod());
            client.setEmergencyContact(request.getEmergencyContact());
            client.setUserType(UserType.CLIENT);
            Client savedClient = userRepository.save(client);
            return ResponseEntity.ok(
                    new SignupResponse(
                            "User registered successfully.",
                            savedClient.getId()
                    )
            );
        }
        else if(request.getUserType() == UserType.ADMIN){

            Admin admin = new Admin();

            // Champs communs
            admin.setFirstName(request.getFirstName());
            admin.setLastName(request.getLastName());
            admin.setCin(request.getCin());
            admin.setDateOfBirth(request.getDateOfBirth());
            admin.setGender(request.getGender());
            admin.setPhoneNumber(request.getPhoneNumber());
            admin.setEmail(request.getEmail());
            admin.setPassword(encoder.encode(request.getPassword()));
            admin.setProfileImage(imagePath);


            admin.setEnabled(true);
            admin.setEmailVerified(false);
            admin.setPhoneVerified(false);
            admin.setAccountLocked(false);

            // Champs Admin
            admin.setDepartment(request.getDepartment());
            admin.setAccessLevel(request.getAccessLevel());
            admin.setAuthorizationDocument(authorizationDocumentPath);
            admin.setUserType(UserType.ADMIN);
            Admin savedAdmin = userRepository.save(admin);

            return ResponseEntity.ok(
                    new SignupResponse(
                            "User registered successfully.",
                            savedAdmin.getId()
                    )
            );

        }
        else{

            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Invalid user type."));
        }
    }
    /**
     * Récupérer tous les utilisateurs
     */
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers(){

        return ResponseEntity.ok(
                userService.getAllUsers()
        );
    }


    /**
     * Récupérer un utilisateur par email
     */
    @GetMapping("/email/{email}")
    public ResponseEntity<User> getUserByEmail(
            @PathVariable String email){

        return userRepository.findByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(
                        ResponseEntity.notFound().build()
                );
    }



    /**
     * Récupérer un utilisateur par id
     */
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(
            @PathVariable Long id){


        User user = userService.getUserById(id);


        if(user == null){
            return ResponseEntity.notFound().build();
        }


        return ResponseEntity.ok(user);
    }




    /**
     * Modifier un utilisateur
     */
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(
            @PathVariable Long id,
            @RequestBody User user){


        user.setId(id);


        User updatedUser =
                userService.editUser(user);


        return ResponseEntity.ok(updatedUser);
    }




    /**
     * Supprimer un utilisateur
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(
            @PathVariable Long id){


        userService.deleteUserById(id);


        return ResponseEntity.ok(
                "User deleted successfully"
        );
    }

    @GetMapping("/profile-image/{filename}")
    public ResponseEntity<?> getProfileImage(
            @PathVariable String filename
    ){

        Resource resource =
                fileStorageService.loadImage(filename);

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_TYPE,
                        MediaType.IMAGE_JPEG_VALUE
                )
                .body(resource);
    }
    @GetMapping("/authorization-document/{filename}")
    public ResponseEntity<?> getAuthorizationDocument(
            @PathVariable String filename){

        Resource resource =
                fileStorageService.loadAuthorizationDocument(filename);

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_TYPE,
                        MediaType.APPLICATION_PDF_VALUE
                )
                .body(resource);
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<UserConversationResponse>>
    getUsersForConversations() {

        return ResponseEntity.ok(
                userService.getAllUsersForConversations()
        );
    }


}
