package org.example.backendyosrmegaapp.entities;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentaireResponse {

    private Long id;

    private String contenu;

    private LocalDateTime dateCommentaire;

    private Long authorId;

    private String authorFirstName;

    private String authorLastName;

    private String authorProfileImage;

    private String authorRole;
}