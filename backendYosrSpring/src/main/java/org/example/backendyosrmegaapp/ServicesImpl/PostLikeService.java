package org.example.backendyosrmegaapp.ServicesImpl;

import lombok.RequiredArgsConstructor;

import org.example.backendyosrmegaapp.Repositories.PostLikeRepository;
import org.example.backendyosrmegaapp.Repositories.PostRepository;
import org.example.backendyosrmegaapp.Repositories.UserRepository;
import org.example.backendyosrmegaapp.entities.LikeResponse;
import org.example.backendyosrmegaapp.entities.Post;
import org.example.backendyosrmegaapp.entities.PostLike;
import org.example.backendyosrmegaapp.entities.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PostLikeService {

    private final PostLikeRepository postLikeRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    public long countLikesByPostId(Long postId) {

        return postLikeRepository
                .countByPostIdAndStatutTrue(postId);
    }
    @Transactional
    public LikeResponse toggleLike(Long postId, Long userId) {

        Post post = postRepository.findById(postId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Post introuvable avec id : " + postId
                        )
                );

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Utilisateur introuvable avec id : " + userId
                        )
                );

        PostLike postLike =
                postLikeRepository
                        .findByUserIdAndPostId(userId, postId)
                        .orElse(null);

        boolean liked;

        if (postLike == null) {

            // Premier like
            postLike = PostLike.builder()
                    .user(user)
                    .post(post)
                    .statut(true)
                    .build();

            postLikeRepository.save(postLike);

            liked = true;

        } else {
            postLike.setStatut(
                    !Boolean.TRUE.equals(postLike.getStatut())
            );

            postLikeRepository.save(postLike);

            liked = Boolean.TRUE.equals(postLike.getStatut());
        }

        long likeCount =
                postLikeRepository.countByPostIdAndStatutTrue(postId);

        return LikeResponse.builder()
                .postId(postId)
                .likeCount(likeCount)
                .likedByCurrentUser(liked)
                .build();
    }

    public boolean isLikedByUser(Long postId, Long userId) {

        return postLikeRepository
                .findByUserIdAndPostId(userId, postId)
                .map(like -> Boolean.TRUE.equals(like.getStatut()))
                .orElse(false);
    }
}