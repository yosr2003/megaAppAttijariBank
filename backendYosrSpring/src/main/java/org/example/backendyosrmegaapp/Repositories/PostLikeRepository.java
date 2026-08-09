package org.example.backendyosrmegaapp.Repositories;

import org.example.backendyosrmegaapp.entities.PostLike;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {

    long countByPostIdAndStatutTrue(Long postId);

}