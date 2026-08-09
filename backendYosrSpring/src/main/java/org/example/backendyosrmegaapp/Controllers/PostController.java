package org.example.backendyosrmegaapp.Controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.example.backendyosrmegaapp.Services.PostService;
import org.example.backendyosrmegaapp.entities.Post;
import org.example.backendyosrmegaapp.entities.PostDetailsResponse;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.example.backendyosrmegaapp.Services.FileStorageService;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PostController {

    private final PostService postService;
private final FileStorageService fileStorageService;
    // ============================
    // CREATE
    // ============================

    @PostMapping(consumes = "multipart/form-data")
    public Post createPost(
            @RequestParam Long authorId,
            @RequestParam("contenu") String contenu,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        Post post = new Post();
        post.setContenu(contenu);

        return postService.createPost(post, authorId, image);
    }

    // ============================
    // READ ALL
    // ============================

    @GetMapping
    public ResponseEntity<List<Post>> getAllPosts() {

        return ResponseEntity.ok(
                postService.getAllPosts()
        );
    }

    // ============================
    // READ ONE
    // ============================

    @GetMapping("/{id}")
    public PostDetailsResponse getPostById(
            @PathVariable Long id
    ) {
        return postService.getPostDetails(id);
    }

    // ============================
    // READ BY AUTHOR
    // ============================

    @GetMapping("/author/{authorId}")
    public ResponseEntity<List<Post>> getPostsByAuthor(
            @PathVariable Long authorId
    ) {

        return ResponseEntity.ok(
                postService.getPostsByAuthor(authorId)
        );
    }

    // ============================
    // UPDATE
    // ============================

    @PutMapping("/{id}")
    public ResponseEntity<Post> updatePost(
            @PathVariable Long id,
            @RequestBody Post post
    ) {

        return ResponseEntity.ok(
                postService.updatePost(id, post)
        );
    }

    // ============================
    // DELETE
    // ============================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(
            @PathVariable Long id
    ) {

        postService.deletePost(id);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/image/{filename:.+}")
    public ResponseEntity<Resource> getPostImage(
            @PathVariable String filename
    ) {

        Resource resource = fileStorageService.loadPostImage(filename);

        String contentType = "application/octet-stream";

        try {
            contentType = MediaTypeFactory
                    .getMediaType(resource)
                    .orElse(MediaType.APPLICATION_OCTET_STREAM)
                    .toString();
        } catch (Exception e) {
            System.out.println("Impossible de déterminer le type de l'image : " + e.getMessage());
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + filename + "\""
                )
                .body(resource);
    }



}