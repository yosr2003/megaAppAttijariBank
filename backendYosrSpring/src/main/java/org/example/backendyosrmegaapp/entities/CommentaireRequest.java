package org.example.backendyosrmegaapp.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentaireRequest {

    private String contenu;
    private Long userId;
}
