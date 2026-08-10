package org.example.backendyosrmegaapp.Repositories;


import org.example.backendyosrmegaapp.entities.Commentaire;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentaireRepository extends JpaRepository<Commentaire, Long> {

    List<Commentaire> findByPostIdOrderByDateCommentaireAsc(Long postId);

    long countByPostId(Long postId);
    void deleteByPostId(Long postId);
}
