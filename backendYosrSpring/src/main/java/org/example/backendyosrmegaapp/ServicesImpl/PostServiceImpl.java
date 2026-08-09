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
    public Post updatePost(Long id, Post post) {

        Post existingPost = postRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Post introuvable avec l'id : " + id)
                );

        existingPost.setTitre(post.getTitre());
        existingPost.setContenu(post.getContenu());
        existingPost.setImage(post.getImage());

        return postRepository.save(existingPost);
    }

    @Override
    public void deletePost(Long id) {

        if (!postRepository.existsById(id)) {
            throw new RuntimeException(
                    "Post introuvable avec l'id : " + id
            );
        }

        postRepository.deleteById(id);
    }
    @Override
    public PostDetailsResponse getPostDetails(Long postId) {

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

        var author = post.getAuthor();

        PostAuthorResponse authorResponse =
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

        return PostDetailsResponse.builder()
                .id(post.getId())
                .titre(post.getTitre())
                .contenu(post.getContenu())
                .image(post.getImage())
                .datePublication(post.getDatePublication())
                .author(authorResponse)
                .likeCount(likeCount)
                .commentCount(commentCount)
                .comments(comments)
                .build();
    }}
