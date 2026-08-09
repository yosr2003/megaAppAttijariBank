package org.example.backendyosrmegaapp.entities;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostAuthorResponse {

    private Long id;

    private String firstName;

    private String lastName;

    private String profileImage;

    private String role;

    private String userType;
}