package org.example.backendyosrmegaapp.Controllers;

import org.example.backendyosrmegaapp.Enum.UserType;
import org.example.backendyosrmegaapp.JWT.JwtUtils;
import org.example.backendyosrmegaapp.Repositories.UserRepository;
import org.example.backendyosrmegaapp.Services.UserService;
import org.example.backendyosrmegaapp.entities.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/auth")
public class UserController {

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



        String jwt =
                jwtUtils.generateJwtToken(authentication);



        UserDetailsImpl userDetails =
                (UserDetailsImpl) authentication.getPrincipal();



        return ResponseEntity.ok(
                new JwtResponse(
                        jwt,
                        userDetails.getId(),
                        userDetails.getFirstName(),
                        userDetails.getLastName(),
                        userDetails.getEmail(),
                        userDetails.getRole()
                )
        );

    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody SignupRequest request) {

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
            client.setProfileImage(request.getProfileImage());

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
            userRepository.save(client);

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
            admin.setProfileImage(request.getProfileImage());

            admin.setEnabled(true);
            admin.setEmailVerified(false);
            admin.setPhoneVerified(false);
            admin.setAccountLocked(false);

            // Champs Admin
            admin.setDepartment(request.getDepartment());
            admin.setAccessLevel(request.getAccessLevel());
            admin.setAuthorizationDocument(request.getAuthorizationDocument());
            admin.setUserType(UserType.ADMIN);
            userRepository.save(admin);

        }
        else{

            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Invalid user type."));
        }

        return ResponseEntity.ok(
                new MessageResponse("User registered successfully.")
        );
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


}
