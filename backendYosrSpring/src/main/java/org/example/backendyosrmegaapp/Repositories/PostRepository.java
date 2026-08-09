package org.example.backendyosrmegaapp.Repositories;

import org.example.backendyosrmegaapp.entities.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    List<Post> findAllByOrderByDatePublicationDesc();

    List<Post> findByAuthorIdOrderByDatePublicationDesc(Long authorId);
}