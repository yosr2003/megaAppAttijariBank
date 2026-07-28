package org.example.backendyosrmegaapp.Services;

import org.example.backendyosrmegaapp.entities.User;
import org.springframework.web.multipart.MultipartFile;

public interface FaceService {

    void registerFace(
            Long userId,
            MultipartFile image
    );


    User authenticate(
            MultipartFile image
    ) throws Exception;


    String extractEmbedding(
            MultipartFile image
    ) throws Exception;

}