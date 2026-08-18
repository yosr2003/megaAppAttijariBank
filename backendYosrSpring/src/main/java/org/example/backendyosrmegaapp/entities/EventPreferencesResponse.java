package org.example.backendyosrmegaapp.entities;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventPreferencesResponse {

    private Long id;

    private Long userId;

    /**
     * Clés des centres d'intérêt.
     *
     * Exemple :
     * ["concerts", "cinema"]
     */
    private List<String> interests;

    /**
     * Clés des périodes.
     *
     * Exemple :
     * ["evening", "weekend_only"]
     */
    private List<String> preferredPeriods;

    /**
     * Clés des localisations.
     *
     * Exemple :
     * ["tunis", "ariana"]
     */
    private List<String> locations;

    private Integer maxDistanceKm;

    private Double minBudget;

    private Double maxBudget;

    private Boolean freeOnly;

    private Boolean anyBudget;

    private Boolean useCurrentLocation;

    private Boolean completed;
}