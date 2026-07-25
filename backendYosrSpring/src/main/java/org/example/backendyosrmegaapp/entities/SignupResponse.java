package org.example.backendyosrmegaapp.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class SignupResponse {

    private String message;
    private Long userId;
}
