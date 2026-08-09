package org.example.backendyosrmegaapp.Repositories;

import org.example.backendyosrmegaapp.entities.PostLike;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {

    long countByPostIdAndStatutTrue(Long postId);
    Optional<PostLike> findByUserIdAndPostId(Long userId, Long postId);

}