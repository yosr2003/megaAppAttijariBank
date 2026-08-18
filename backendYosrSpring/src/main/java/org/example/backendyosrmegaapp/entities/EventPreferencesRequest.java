package org.example.backendyosrmegaapp.entities;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventPreferencesRequest {

    /**
     * Exemple :
     * ["concerts", "cinema", "sports"]
     */
    private List<String> interests;

    /**
     * Exemple :
     * ["evening", "weekend_only"]
     */
    private List<String> preferredPeriods;

    /**
     * Exemple :
     * ["tunis", "ariana"]
     */
    private List<String> locations;

    /**
     * Distance maximale en kilomètres.
     */
    private Integer maxDistanceKm;

    /**
     * Budget minimum en DT.
     */
    private Double minBudget;

    /**
     * Budget maximum en DT.
     */
    private Double maxBudget;

    /**
     * Seulement les événements gratuits.
     */
    private Boolean freeOnly;

    /**
     * Aucun filtre de budget.
     */
    private Boolean anyBudget;

    /**
     * Utiliser la position actuelle.
     */
    private Boolean useCurrentLocation;
}