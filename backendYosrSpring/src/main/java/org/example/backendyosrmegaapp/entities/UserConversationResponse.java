package org.example.backendyosrmegaapp.entities;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserConversationResponse {

    private Long id;

    private String firstName;

    private String lastName;

    private String email;

    private String profileImage;

    private String userType;
}