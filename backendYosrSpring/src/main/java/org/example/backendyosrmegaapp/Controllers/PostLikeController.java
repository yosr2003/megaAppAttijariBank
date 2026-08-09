package org.example.backendyosrmegaapp.Controllers;



import lombok.RequiredArgsConstructor;
import org.example.backendyosrmegaapp.ServicesImpl.PostLikeService;
import org.example.backendyosrmegaapp.entities.LikeResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PostLikeController {

    private final PostLikeService postLikeService;

    @PostMapping("/{postId}/like")
    public ResponseEntity<LikeResponse> toggleLike(
            @PathVariable Long postId,
            @RequestParam Long userId
    ) {

        LikeResponse response =
                postLikeService.toggleLike(postId, userId);

        return ResponseEntity.ok(response);
    }
}