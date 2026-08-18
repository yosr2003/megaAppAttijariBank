package org.example.backendyosrmegaapp.entities;

import jakarta.persistence.*;
import lombok.*;
import org.example.backendyosrmegaapp.Enum.EventOptionType;

@Entity
@Table(
        name = "event_options",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_event_option_key",
                        columnNames = "option_key"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Clé utilisée par le frontend.
     *
     * Exemples :
     * concerts
     * cinema
     * evening
     * weekend_only
     * tunis
     */
    @Column(
            name = "option_key",
            nullable = false,
            unique = true,
            length = 100
    )
    private String key;

    /**
     * Texte affiché au frontend.
     *
     * Exemples :
     * Concerts
     * Cinéma
     * Soirée
     * Tunis
     */
    @Column(nullable = false, length = 150)
    private String label;

    /**
     * Permet de distinguer :
     * INTEREST
     * PERIOD
     * LOCATION
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EventOptionType type;

    /**
     * Nom de l'icône utilisée éventuellement par le frontend.
     */
    @Column(length = 100)
    private String icon;

    /**
     * Permet de désactiver une option sans la supprimer.
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    /**
     * Ordre d'affichage.
     */
    private Integer displayOrder;
}