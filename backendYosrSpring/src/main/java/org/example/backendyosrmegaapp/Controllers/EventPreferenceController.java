package org.example.backendyosrmegaapp.Controllers;



import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.backendyosrmegaapp.Services.EventPreferenceService;
import org.example.backendyosrmegaapp.entities.EventPreferencesRequest;
import org.example.backendyosrmegaapp.entities.EventPreferencesResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/event-preferences")
@RequiredArgsConstructor
public class EventPreferenceController {

    private final EventPreferenceService preferenceService;

    /**
     * Récupérer les préférences d'un utilisateur
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<EventPreferencesResponse> getPreferences(
            @PathVariable Long userId
    ) {

        return ResponseEntity.ok(
                preferenceService.getPreferences(userId)
        );
    }

    /**
     * Créer les préférences
     */
    @PostMapping("/user/{userId}")
    public ResponseEntity<EventPreferencesResponse> savePreferences(
            @PathVariable Long userId,
            @Valid @RequestBody EventPreferencesRequest request
    ) {

        return ResponseEntity.ok(
                preferenceService.savePreferences(
                        userId,
                        request
                )
        );
    }

    /**
     * Modifier les préférences
     */
    @PutMapping("/user/{userId}")
    public ResponseEntity<EventPreferencesResponse> updatePreferences(
            @PathVariable Long userId,
            @Valid @RequestBody EventPreferencesRequest request
    ) {

        return ResponseEntity.ok(
                preferenceService.updatePreferences(
                        userId,
                        request
                )
        );
    }

    /**
     * Supprimer les préférences
     */
    @DeleteMapping("/user/{userId}")
    public ResponseEntity<Void> deletePreferences(
            @PathVariable Long userId
    ) {

        preferenceService.deletePreferences(userId);

        return ResponseEntity.noContent().build();
    }
}
