package org.example.backendyosrmegaapp.ServicesImpl;

import lombok.RequiredArgsConstructor;
import org.example.backendyosrmegaapp.Repositories.PostRepository;
import org.example.backendyosrmegaapp.Repositories.UserRepository;
import org.example.backendyosrmegaapp.Services.FileStorageService;
import org.example.backendyosrmegaapp.Services.PostService;
import org.example.backendyosrmegaapp.entities.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final CommentaireServiceImpl commentaireService;
    private final PostLikeService postLikeService;
    @Autowired
    private FileStorageService fileStorageService;

    @Override
    public Post createPost(Post post, Long authorId, MultipartFile image) {

        User author = userRepository.findById(authorId)
                .orElseThrow(() ->
                        new RuntimeException("Utilisateur introuvable avec l'id : " + authorId)
                );

        post.setAuthor(author);

        // 👉 gérer image si existe
        if (image != null && !image.isEmpty()) {
            try {
                String filename = fileStorageService.savePostImage(image);
                post.setImage(filename);
            } catch (IOException e) {
                throw new RuntimeException("Erreur upload image", e);
            }
        }
        return postRepository.save(post);
    }

    @Override
    public Post createPost(Post post, Long authorId) {
        return null;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Post> getAllPosts() {
        return postRepository.findAllByOrderByDatePublicationDesc();
    }

    @Override
    @Transactional(readOnly = true)
    public Post getPostById(Long id) {

        return postRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Post introuvable avec l'id : " + id)
                );
    }

    @Override
    @Transactional(readOnly = true)
    public List<Post> getPostsByAuthor(Long authorId) {

        if (!userRepository.existsById(authorId)) {
            throw new RuntimeException(
                    "Utilisateur introuvable avec l'id : " + authorId
            );
        }

        return postRepository.findByAuthorIdOrderByDatePublicationDesc(authorId);
    }

    @Override
    public Post updatePost(Long id, String contenu, MultipartFile image) {

        Post existingPost = postRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Post introuvable avec l'id : " + id)
                );

        existingPost.setContenu(contenu);

        // 🔥 Gestion image
        if (image != null && !image.isEmpty()) {
            try {
                String filename = fileStorageService.savePostImage(image);
                existingPost.setImage(filename);
            } catch (IOException e) {
                throw new RuntimeException("Erreur upload image", e);
            }
        }

        return postRepository.save(existingPost);
    }

    @Override
    @Transactional
    public void deletePost(Long id) {

        if (!postRepository.existsById(id)) {
            throw new RuntimeException(
                    "Post introuvable avec l'id : " + id
            );
        }

        // 1. Supprimer les commentaires liés au post
        commentaireService.supprimerCommentairesDuPost(id);

        // 2. Supprimer les likes liés au post
        postLikeService.supprimerLikesDuPost(id);

        // 3. Supprimer le post
        postRepository.deleteById(id);
    }


    @Override
    public PostDetailsResponse getPostDetails(
            Long postId,
            Long userId
    ) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Post introuvable avec id : " + postId
                        )
                );

        List<CommentaireResponse> comments =
                commentaireService.getCommentsByPostId(postId);

        long commentCount =
                commentaireService.countCommentsByPostId(postId);

        long likeCount =
                postLikeService.countLikesByPostId(postId);

        // Vérifier si l'utilisateur connecté
        // a liké CE post
        boolean likedByCurrentUser =
                postLikeService.isLikedByUser(
                        postId,
                        userId
                );

        PostAuthorResponse authorResponse = null;

        if (post.getAuthor() != null) {

            var author = post.getAuthor();

            authorResponse =
                    PostAuthorResponse.builder()
                            .id(author.getId())
                            .firstName(author.getFirstName())
                            .lastName(author.getLastName())
                            .profileImage(author.getProfileImage())
                            .role(
                                    author.getUserType() != null
                                            ? author.getUserType().toString()
                                            : "Membre"
                            )
                            .userType(
                                    author.getUserType() != null
                                            ? author.getUserType().toString()
                                            : null
                            )
                            .build();
        }

        return PostDetailsResponse.builder()
                .id(post.getId())
                .titre(post.getTitre())
                .contenu(post.getContenu())
                .image(post.getImage())
                .datePublication(post.getDatePublication())
                .author(authorResponse)

                // Nombre total de likes
                .likeCount(likeCount)

                // Est-ce que CE user a liké ?
                .likedByCurrentUser(likedByCurrentUser)

                .commentCount(commentCount)
                .comments(comments)
                .build();
    }
}
