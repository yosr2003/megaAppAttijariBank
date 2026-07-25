package org.example.backendyosrmegaapp.Config;

import org.springframework.context.annotation.Configuration;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class FileStorageConfig {


    public final Path uploadDir =
            Paths.get("uploads/profile");


}