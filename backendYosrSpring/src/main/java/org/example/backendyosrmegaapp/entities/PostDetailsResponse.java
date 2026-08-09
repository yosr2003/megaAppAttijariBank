package org.example.backendyosrmegaapp.entities;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostDetailsResponse {

    private Long id;

    private String titre;

    private String contenu;

    private String image;

    private LocalDateTime datePublication;

    private PostAuthorResponse author;

    private long likeCount;
    private boolean likedByCurrentUser;

    private long commentCount;

    private List<CommentaireResponse> comments;
}