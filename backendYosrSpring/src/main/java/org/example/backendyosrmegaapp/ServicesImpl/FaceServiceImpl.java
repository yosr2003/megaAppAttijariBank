package org.example.backendyosrmegaapp.ServicesImpl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import org.example.backendyosrmegaapp.JWT.JwtUtils;
import org.example.backendyosrmegaapp.Repositories.FaceBiometricRepository;
import org.example.backendyosrmegaapp.Repositories.UserRepository;
import org.example.backendyosrmegaapp.Services.FaceService;
import org.example.backendyosrmegaapp.entities.FaceBiometric;

import org.example.backendyosrmegaapp.entities.User;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FaceServiceImpl implements FaceService {
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;
    private final FaceBiometricRepository faceBiometricRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private static final String UPLOAD_DIR = "uploads/faces/";

    @Override
    public void registerFace(Long userId, MultipartFile image) {


        User user = userRepository.findById(userId)
                .orElseThrow(
                        () -> new RuntimeException("Utilisateur introuvable")
                );


        if(faceBiometricRepository
                .findByUser_Id(userId)
                .isPresent()){

            throw new RuntimeException(
                    "Cet utilisateur possède déjà un visage enregistré."
            );
        }



        try {


            String embedding;

            try {
                embedding = extractEmbedding(image);
            }
            catch(Exception e){
                throw new RuntimeException("Erreur reconnaissance faciale",e);
            }


            FaceBiometric biometric = FaceBiometric.builder()
                    .user(user)
                    .embedding(embedding)
                    .active(true)
                    .build();



            faceBiometricRepository.save(biometric);



            user.setBiometricEnabled(true);
            user.setBiometricType("FACE");

            userRepository.save(user);



        } catch(Exception e){
            e.printStackTrace();
            throw new RuntimeException(
                    "Erreur reconnaissance faciale",
                    e
            );
        }

    }

    @Override
    public User authenticate(MultipartFile image) throws Exception {

        String inputEmbedding = extractEmbedding(image);

        List<FaceBiometric> biometrics = faceBiometricRepository.findAll();

        FaceBiometric bestMatch = null;
        double bestScore = 0.0;

        for (FaceBiometric biometric : biometrics) {

            if (!biometric.getActive()) {
                continue;
            }

            double score = compareEmbeddings(
                    inputEmbedding,
                    biometric.getEmbedding()
            );

            System.out.println(
                    biometric.getUser().getEmail()
                            + " -> "
                            + score
            );

            if (score > bestScore) {
                bestScore = score;
                bestMatch = biometric;
            }
        }

        double THRESHOLD = 0.80;

        if (bestMatch == null || bestScore < THRESHOLD) {
            return null;
        }

        return bestMatch.getUser();
    }
    @Override
    public String extractEmbedding(MultipartFile image) throws Exception {

        String url = "http://localhost:5000/extract";

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

        ByteArrayResource fileResource = new ByteArrayResource(image.getBytes()) {

            @Override
            public String getFilename() {
                return image.getOriginalFilename();
            }
        };

        body.add("image", fileResource);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        HttpEntity<MultiValueMap<String, Object>> request =
                new HttpEntity<>(body, headers);

        ResponseEntity<String> response =
                restTemplate.postForEntity(
                        url,
                        request,
                        String.class
                );

        ObjectMapper mapper = new ObjectMapper();

        JsonNode root = mapper.readTree(response.getBody());

        if (!root.get("success").asBoolean()) {
            throw new RuntimeException("Erreur lors de l'extraction de l'embedding.");
        }

        JsonNode embeddingNode = root.get("embedding");

        // Retourne uniquement le tableau JSON
        return mapper.writeValueAsString(embeddingNode);
    }


    private double compareEmbeddings(String embedding1, String embedding2) throws Exception {

        String url = "http://localhost:5000/compare";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        ObjectMapper mapper = new ObjectMapper();

        ObjectNode body = mapper.createObjectNode();

        body.set("embedding1", mapper.readTree(embedding1));
        body.set("embedding2", mapper.readTree(embedding2));

        HttpEntity<String> request =
                new HttpEntity<>(body.toString(), headers);

        ResponseEntity<String> response =
                restTemplate.postForEntity(
                        url,
                        request,
                        String.class
                );

        JsonNode json = mapper.readTree(response.getBody());

        if (!json.get("success").asBoolean()) {
            throw new RuntimeException("Erreur lors de la comparaison des embeddings.");
        }

        return json.get("similarity").asDouble();
    }



}