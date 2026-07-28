package org.example.backendyosrmegaapp.entities;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FaceRegistrationResponse {

    private boolean success;

    private String message;

}
