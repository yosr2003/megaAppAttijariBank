package org.example.backendyosrmegaapp.Services;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class FileStorageService {

    // ============================
    // PROFILE IMAGES
    // ============================

    private final Path root =
            Paths.get("uploads/profile");

    // ============================
    // POST IMAGES
    // ============================

    private final Path root2 =
            Paths.get("uploads/posts");


    // ============================
    // SAVE PROFILE IMAGE
    // ============================

    public String saveProfileImage(MultipartFile file)
            throws IOException {

        if (!Files.exists(root)) {
            Files.createDirectories(root);
        }

        String filename =
                UUID.randomUUID()
                        + "_"
                        + file.getOriginalFilename();

        Path destination =
                root.resolve(filename);

        Files.copy(
                file.getInputStream(),
                destination,
                StandardCopyOption.REPLACE_EXISTING
        );

        return filename;
    }


    // ============================
    // LOAD PROFILE IMAGE
    // ============================

    public Resource loadImage(String filename) {

        try {

            Path file =
                    root.resolve(filename);

            Resource resource =
                    new UrlResource(
                            file.toUri()
                    );

            if (resource.exists() && resource.isReadable()) {
                return resource;
            }

            throw new RuntimeException(
                    "Image de profil introuvable : " + filename
            );

        } catch (Exception e) {

            throw new RuntimeException(
                    "Erreur lors du chargement de l'image de profil",
                    e
            );
        }
    }


    // ============================
    // SAVE POST IMAGE
    // ============================

    public String savePostImage(MultipartFile file)
            throws IOException {

        // Créer uploads/posts si nécessaire
        if (!Files.exists(root2)) {
            Files.createDirectories(root2);
        }

        // Nom unique
        String filename =
                UUID.randomUUID()
                        + "_"
                        + file.getOriginalFilename();

        // Destination
        Path destination =
                root2.resolve(filename);

        // Sauvegarde
        Files.copy(
                file.getInputStream(),
                destination,
                StandardCopyOption.REPLACE_EXISTING
        );

        return filename;
    }


    // ============================
    // LOAD POST IMAGE
    // ============================

    public Resource loadPostImage(String filename) {

        try {

            Path file =
                    root2.resolve(filename);

            Resource resource =
                    new UrlResource(
                            file.toUri()
                    );

            if (resource.exists() && resource.isReadable()) {
                return resource;
            }

            throw new RuntimeException(
                    "Image du post introuvable : " + filename
            );

        } catch (Exception e) {

            throw new RuntimeException(
                    "Erreur lors du chargement de l'image du post",
                    e
            );
        }
    }


    // ============================
    // SAVE AUTHORIZATION DOCUMENT
    // ============================

    public String saveAuthorizationDocument(
            MultipartFile file
    ) throws IOException {

        String fileName =
                UUID.randomUUID()
                        + "_"
                        + file.getOriginalFilename();

        Path uploadPath =
                Paths.get(
                        "uploads/authorization-documents"
                );

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        Files.copy(
                file.getInputStream(),
                uploadPath.resolve(fileName),
                StandardCopyOption.REPLACE_EXISTING
        );

        return fileName;
    }


    // ============================
    // LOAD AUTHORIZATION DOCUMENT
    // ============================

    public Resource loadAuthorizationDocument(
            String filename
    ) {

        Path path =
                Paths.get(
                        "uploads/authorization-documents"
                ).resolve(filename);

        try {

            Resource resource =
                    new UrlResource(
                            path.toUri()
                    );

            if (resource.exists() && resource.isReadable()) {
                return resource;
            }

            throw new RuntimeException(
                    "Document introuvable"
            );

        } catch (Exception e) {

            throw new RuntimeException(
                    "Erreur lors du chargement du document",
                    e
            );
        }
    }
}

