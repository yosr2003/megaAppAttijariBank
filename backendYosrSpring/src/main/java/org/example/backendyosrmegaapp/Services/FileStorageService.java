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


    private final Path root =
            Paths.get("uploads/profile");


    public String saveProfileImage(MultipartFile file)
            throws IOException {


        if(!Files.exists(root)){
            Files.createDirectories(root);
        }


        String filename =
                UUID.randomUUID()
                        .toString()
                        +"_"+file.getOriginalFilename();


        Path destination =
                root.resolve(filename);


        Files.copy(
                file.getInputStream(),
                destination,
                StandardCopyOption.REPLACE_EXISTING
        );


        return filename;

    }



    public Resource loadImage(String filename){

        try{

            Path file =
                    root.resolve(filename);


            Resource resource =
                    new UrlResource(
                            file.toUri()
                    );


            if(resource.exists()){
                return resource;
            }

            throw new RuntimeException(
                    "Image not found"
            );


        }catch(Exception e){

            throw new RuntimeException(e);

        }

    }
    public String saveAuthorizationDocument(MultipartFile file) throws IOException {

        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();

        Path uploadPath = Paths.get("uploads/authorization-documents");

        if(!Files.exists(uploadPath)){
            Files.createDirectories(uploadPath);
        }

        Files.copy(
                file.getInputStream(),
                uploadPath.resolve(fileName),
                StandardCopyOption.REPLACE_EXISTING
        );

        return fileName;
    }
    public Resource loadAuthorizationDocument(String filename){

        Path path = Paths.get("uploads/authorization-documents")
                .resolve(filename);

        try{
            Resource resource = new UrlResource(path.toUri());

            if(resource.exists() || resource.isReadable()){
                return resource;
            }

            throw new RuntimeException("Document introuvable");

        }catch(Exception e){
            throw new RuntimeException("Erreur lors du chargement du document");
        }
    }
}



