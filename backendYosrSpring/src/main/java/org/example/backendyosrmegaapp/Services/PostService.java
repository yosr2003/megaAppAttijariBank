package org.example.backendyosrmegaapp.Services;

import org.example.backendyosrmegaapp.entities.Post;
import org.example.backendyosrmegaapp.entities.PostDetailsResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface PostService {

    Post createPost(Post post, Long authorId, MultipartFile image);

    Post createPost(Post post, Long authorId);

    List<Post> getAllPosts();

    Post getPostById(Long id);

    List<Post> getPostsByAuthor(Long authorId);

    Post updatePost(Long id, String contenu, MultipartFile image);

    void deletePost(Long id);


    PostDetailsResponse getPostDetails(
            Long postId,
            Long userId
    );
}
