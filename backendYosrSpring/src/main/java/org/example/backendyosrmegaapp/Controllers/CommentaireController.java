package org.example.backendyosrmegaapp.Controllers;



import lombok.RequiredArgsConstructor;


import org.example.backendyosrmegaapp.ServicesImpl.CommentaireServiceImpl;
import org.example.backendyosrmegaapp.entities.CommentaireResponse;
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
}
