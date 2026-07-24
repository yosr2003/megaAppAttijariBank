package org.example.backendyosrmegaapp.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class JwtResponse {


    private String token;


    private String type = "Bearer";


    private Long id;


    private String firstName;


    private String lastName;


    private String email;


    private String role;



    public JwtResponse(
            String token,
            Long id,
            String firstName,
            String lastName,
            String email,
            String role
    ){

        this.token = token;
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.role = role;
        this.type = "Bearer";

    }

}