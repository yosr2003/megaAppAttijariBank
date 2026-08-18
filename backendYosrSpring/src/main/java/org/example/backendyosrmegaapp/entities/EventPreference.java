package org.example.backendyosrmegaapp.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "event_preferences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Un utilisateur possède une seule configuration
     * de préférences événement.
     */
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            unique = true
    )
    private User user;

    /**
     * Toutes les options sélectionnées par l'utilisateur.
     *
     * Les options peuvent être :
     * - INTEREST
     * - PERIOD
     * - LOCATION
     *
     * La distinction est faite grâce à EventOption.type.
     */
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "event_preference_options",
            joinColumns = @JoinColumn(name = "preference_id"),
            inverseJoinColumns = @JoinColumn(name = "option_id"),
            uniqueConstraints = {
                    @UniqueConstraint(
                            name = "uk_preference_option",
                            columnNames = {
                                    "preference_id",
                                    "option_id"
                            }
                    )
            }
    )
    @Builder.Default
    private List<EventOption> options = new ArrayList<>();

    /**
     * Distance maximale souhaitée en kilomètres.
     */
    private Integer maxDistanceKm;

    /**
     * Budget minimum en DT.
     */
    @Column(nullable = false)
    @Builder.Default
    private Double minBudget = 0.0;

    /**
     * Budget maximum en DT.
     */
    @Column(nullable = false)
    @Builder.Default
    private Double maxBudget = 100.0;

    /**
     * L'utilisateur veut uniquement
     * des événements gratuits.
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean freeOnly = false;

    /**
     * L'utilisateur ne veut aucune
     * restriction de budget.
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean anyBudget = false;

    /**
     * Indique si l'utilisateur a terminé
     * le questionnaire.
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean completed = false;

    /**
     * L'utilisateur veut utiliser
     * sa position actuelle.
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean useCurrentLocation = false;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {

        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();

        if (minBudget == null) {
            minBudget = 0.0;
        }

        if (maxBudget == null) {
            maxBudget = 100.0;
        }

        if (freeOnly == null) {
            freeOnly = false;
        }

        if (anyBudget == null) {
            anyBudget = false;
        }

        if (completed == null) {
            completed = false;
        }

        if (useCurrentLocation == null) {
            useCurrentLocation = false;
        }
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}