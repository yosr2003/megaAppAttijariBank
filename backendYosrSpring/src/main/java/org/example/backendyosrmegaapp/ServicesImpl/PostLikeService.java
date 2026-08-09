package org.example.backendyosrmegaapp.ServicesImpl;

import lombok.RequiredArgsConstructor;

import org.example.backendyosrmegaapp.Repositories.PostLikeRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PostLikeService {

    private final PostLikeRepository postLikeRepository;

    public long countLikesByPostId(Long postId) {

        return postLikeRepository
                .countByPostIdAndStatutTrue(postId);
    }
}