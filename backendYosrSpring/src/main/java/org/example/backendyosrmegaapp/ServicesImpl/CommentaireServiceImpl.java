package org.example.backendyosrmegaapp.ServicesImpl;

import lombok.RequiredArgsConstructor;

import org.example.backendyosrmegaapp.Repositories.CommentaireRepository;
import org.example.backendyosrmegaapp.Repositories.PostRepository;
import org.example.backendyosrmegaapp.Repositories.UserRepository;
import org.example.backendyosrmegaapp.entities.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentaireServiceImpl {

    private final CommentaireRepository commentaireRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

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


    public CommentaireResponse ajouterCommentaire(
            Long postId,
            CommentaireRequest request
    ) {

        if (request.getContenu() == null ||
                request.getContenu().trim().isEmpty()) {
            throw new RuntimeException("Le commentaire ne peut pas être vide");
        }

        Post post = postRepository.findById(postId)
                .orElseThrow(() ->
                        new RuntimeException("Post non trouvé avec id : " + postId));

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() ->
                        new RuntimeException("Utilisateur non trouvé avec id : "
                                + request.getUserId()));

        Commentaire commentaire = Commentaire.builder()
                .contenu(request.getContenu().trim())
                .author(user)
                .post(post)
                .build();

        Commentaire savedCommentaire =
                commentaireRepository.save(commentaire);

        return toResponse(savedCommentaire);
    }

    public List<CommentaireResponse> getCommentairesByPost(Long postId) {

        if (!postRepository.existsById(postId)) {
            throw new RuntimeException(
                    "Post non trouvé avec id : " + postId
            );
        }

        return commentaireRepository
                .findByPostIdOrderByDateCommentaireAsc(postId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void supprimerCommentairesDuPost(Long postId) {
        commentaireRepository.deleteByPostId(postId);
    }





}