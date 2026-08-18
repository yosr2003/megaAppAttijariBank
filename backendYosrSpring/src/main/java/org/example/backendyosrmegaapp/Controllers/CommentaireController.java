package org.example.backendyosrmegaapp.Controllers;



import lombok.RequiredArgsConstructor;


import org.example.backendyosrmegaapp.ServicesImpl.CommentaireServiceImpl;
import org.example.backendyosrmegaapp.entities.CommentaireRequest;
import org.example.backendyosrmegaapp.entities.CommentaireResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentaireController {

    private final CommentaireServiceImpl commentaireService;

    @GetMapping("/post/{postId}")
    public List<CommentaireResponse> getCommentsByPost(
            @PathVariable Long postId
    ) {
        return commentaireService
                .getCommentsByPostId(postId);
    }
    @PostMapping("/post/{postId}")
    public ResponseEntity<CommentaireResponse> ajouterCommentaire(
            @PathVariable Long postId,
            @RequestBody CommentaireRequest request
    ) {

        CommentaireResponse response =
                commentaireService.ajouterCommentaire(postId, request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // ============================================================
    // UPDATE COMMENT
    // ============================================================

    @PutMapping("/{commentId}")
    public ResponseEntity<CommentaireResponse> updateComment(
            @PathVariable Long commentId,
            @RequestBody CommentaireRequest request
    ) {

        return ResponseEntity.ok(
                commentaireService.modifierCommentaire(
                        commentId,
                        request
                )
        );
    }
    // ============================================================
    // DELETE COMMENT
    // ============================================================

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long commentId,
            @RequestParam Long userId
    ) {

        commentaireService.supprimerCommentaire(
                commentId,
                userId
        );

        return ResponseEntity.noContent().build();
    }
}
