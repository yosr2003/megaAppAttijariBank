package org.example.backendyosrmegaapp.ServicesImpl;

import lombok.RequiredArgsConstructor;

import org.example.backendyosrmegaapp.Repositories.CommentaireRepository;
import org.example.backendyosrmegaapp.entities.Commentaire;

import org.example.backendyosrmegaapp.entities.CommentaireResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentaireServiceImpl {

    private final CommentaireRepository commentaireRepository;

    public List<CommentaireResponse> getCommentsByPostId(Long postId) {

        return commentaireRepository
                .findByPostIdOrderByDateCommentaireAsc(postId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public long countCommentsByPostId(Long postId) {

        return commentaireRepository.countByPostId(postId);
    }

    private CommentaireResponse toResponse(Commentaire comment) {

        var author = comment.getAuthor();

        return CommentaireResponse.builder()
                .id(comment.getId())
                .contenu(comment.getContenu())
                .dateCommentaire(comment.getDateCommentaire())
                .authorId(author.getId())
                .authorFirstName(author.getFirstName())
                .authorLastName(author.getLastName())
                .authorProfileImage(author.getProfileImage())
                .authorRole(
                        author.getUserType() != null
                                ? author.getUserType().toString()
                                : "Membre"
                )
                .build();
    }
}