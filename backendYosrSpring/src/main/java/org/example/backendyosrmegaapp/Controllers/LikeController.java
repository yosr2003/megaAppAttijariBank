package org.example.backendyosrmegaapp.Controllers;

import lombok.RequiredArgsConstructor;

import org.example.backendyosrmegaapp.ServicesImpl.PostLikeService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/likes")
@RequiredArgsConstructor
public class LikeController {

    private final PostLikeService likeService;

    @GetMapping("/post/{postId}/count")
    public long getLikeCount(
            @PathVariable Long postId
    ) {
        return likeService.countLikesByPostId(postId);
    }
}
