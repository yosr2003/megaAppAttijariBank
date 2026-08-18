package org.example.backendyosrmegaapp.ServicesImpl;

import lombok.RequiredArgsConstructor;

import org.example.backendyosrmegaapp.Enum.EventOptionType;
import org.example.backendyosrmegaapp.Repositories.EventOptionRepository;
import org.example.backendyosrmegaapp.Repositories.EventPreferenceRepository;
import org.example.backendyosrmegaapp.Repositories.UserRepository;
import org.example.backendyosrmegaapp.Services.EventPreferenceService;
import org.example.backendyosrmegaapp.entities.EventOption;

import org.example.backendyosrmegaapp.entities.EventPreference;
import org.example.backendyosrmegaapp.entities.EventPreferencesRequest;
import org.example.backendyosrmegaapp.entities.EventPreferencesResponse;
import org.example.backendyosrmegaapp.entities.User;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class EventPreferenceServiceImpl
        implements EventPreferenceService {

    private final EventPreferenceRepository preferenceRepository;

    private final EventOptionRepository eventOptionRepository;

    private final UserRepository userRepository;


    // =========================================================
    // GET
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public EventPreferencesResponse getPreferences(Long userId) {

        EventPreference preference =
                preferenceRepository.findByUserId(userId)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Préférences événements introuvables"
                                )
                        );

        return toResponse(preference);
    }


    // =========================================================
    // SAVE
    // =========================================================

    @Override
    public EventPreferencesResponse savePreferences(
            Long userId,
            EventPreferencesRequest request
    ) {

        if (preferenceRepository.existsByUserId(userId)) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Les préférences existent déjà pour cet utilisateur"
            );
        }

        User user =
                userRepository.findById(userId)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Utilisateur introuvable"
                                )
                        );

        EventPreference preference = new EventPreference();

        preference.setUser(user);

        applyRequest(preference, request);

        preference.setCompleted(true);

        EventPreference saved =
                preferenceRepository.save(preference);

        return toResponse(saved);
    }


    // =========================================================
    // UPDATE
    // =========================================================

    @Override
    public EventPreferencesResponse updatePreferences(
            Long userId,
            EventPreferencesRequest request
    ) {

        EventPreference preference =
                preferenceRepository.findByUserId(userId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Préférences introuvables"
                                )
                        );

        applyRequest(preference, request);

        preference.setCompleted(true);

        EventPreference updated =
                preferenceRepository.save(preference);

        return toResponse(updated);
    }


    // =========================================================
    // DELETE
    // =========================================================

    @Override
    public void deletePreferences(Long userId) {

        EventPreference preference =
                preferenceRepository.findByUserId(userId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Préférences introuvables"
                                )
                        );

        preferenceRepository.delete(preference);
    }


    // =========================================================
    // APPLY REQUEST
    // =========================================================

    private void applyRequest(
            EventPreference preference,
            EventPreferencesRequest request
    ) {

        if (request == null) {

            throw new RuntimeException(
                    "La requête de préférences est vide"
            );
        }


        /*
         * =====================================================
         * OPTIONS
         * =====================================================
         *
         * Le frontend envoie toujours trois listes :
         *
         * interests
         * preferredPeriods
         * locations
         *
         * Mais en base nous avons UNE SEULE liste :
         *
         * preference.options
         *
         * Le type de chaque option permet de faire la distinction.
         */

        List<EventOption> options =
                new ArrayList<>();


        // =====================================================
        // INTERESTS
        // =====================================================

        if (request.getInterests() != null) {

            for (String key : request.getInterests()) {

                if (key == null || key.isBlank()) {
                    continue;
                }

                EventOption option =
                        eventOptionRepository.findByKey(key)
                                .orElseThrow(() ->
                                        new RuntimeException(
                                                "Centre d'intérêt introuvable : "
                                                        + key
                                        )
                                );

                /*
                 * Vérification importante :
                 * une clé envoyée dans "interests"
                 * doit réellement être de type INTEREST.
                 */
                if (option.getType() != EventOptionType.INTEREST) {

                    throw new RuntimeException(
                            "L'option '" + key
                                    + "' n'est pas un centre d'intérêt"
                    );
                }

                if (!Boolean.TRUE.equals(option.getActive())) {

                    throw new RuntimeException(
                            "Le centre d'intérêt '" + key
                                    + "' est désactivé"
                    );
                }

                options.add(option);
            }
        }


        // =====================================================
        // PERIODS
        // =====================================================

        if (request.getPreferredPeriods() != null) {

            for (String key : request.getPreferredPeriods()) {

                if (key == null || key.isBlank()) {
                    continue;
                }

                EventOption option =
                        eventOptionRepository.findByKey(key)
                                .orElseThrow(() ->
                                        new RuntimeException(
                                                "Période introuvable : "
                                                        + key
                                        )
                                );

                /*
                 * Vérification importante :
                 * une clé envoyée dans "preferredPeriods"
                 * doit être de type PERIOD.
                 */
                if (option.getType() != EventOptionType.PERIOD) {

                    throw new RuntimeException(
                            "L'option '" + key
                                    + "' n'est pas une période"
                    );
                }

                if (!Boolean.TRUE.equals(option.getActive())) {

                    throw new RuntimeException(
                            "La période '" + key
                                    + "' est désactivée"
                    );
                }

                options.add(option);
            }
        }


        // =====================================================
        // LOCATIONS
        // =====================================================

        if (request.getLocations() != null) {

            for (String key : request.getLocations()) {

                if (key == null || key.isBlank()) {
                    continue;
                }

                EventOption option =
                        eventOptionRepository.findByKey(key)
                                .orElseThrow(() ->
                                        new RuntimeException(
                                                "Localisation introuvable : "
                                                        + key
                                        )
                                );

                /*
                 * Vérification importante :
                 * une clé envoyée dans "locations"
                 * doit être de type LOCATION.
                 */
                if (option.getType() != EventOptionType.LOCATION) {

                    throw new RuntimeException(
                            "L'option '" + key
                                    + "' n'est pas une localisation"
                    );
                }

                if (!Boolean.TRUE.equals(option.getActive())) {

                    throw new RuntimeException(
                            "La localisation '" + key
                                    + "' est désactivée"
                    );
                }

                options.add(option);
            }
        }


        /*
         * On sauvegarde UNE SEULE liste dans EventPreference.
         */
        preference.setOptions(options);


        // =====================================================
        // DISTANCE
        // =====================================================

        preference.setMaxDistanceKm(
                request.getMaxDistanceKm()
        );


        // =====================================================
        // BUDGET
        // =====================================================

        preference.setMinBudget(
                request.getMinBudget() != null
                        ? request.getMinBudget()
                        : 0.0
        );

        preference.setMaxBudget(
                request.getMaxBudget() != null
                        ? request.getMaxBudget()
                        : 100.0
        );


        // =====================================================
        // FREE ONLY
        // =====================================================

        preference.setFreeOnly(
                request.getFreeOnly() != null
                        ? request.getFreeOnly()
                        : false
        );


        // =====================================================
        // ANY BUDGET
        // =====================================================

        preference.setAnyBudget(
                request.getAnyBudget() != null
                        ? request.getAnyBudget()
                        : false
        );


        // =====================================================
        // CURRENT LOCATION
        // =====================================================

        preference.setUseCurrentLocation(
                request.getUseCurrentLocation() != null
                        ? request.getUseCurrentLocation()
                        : false
        );
    }


    // =========================================================
    // ENTITY -> RESPONSE
    // =========================================================

    private EventPreferencesResponse toResponse(
            EventPreference preference
    ) {

        /*
         * On récupère la liste unique :
         *
         * preference.getOptions()
         *
         * puis on la sépare à nouveau en trois listes
         * pour correspondre exactement au frontend.
         */

        List<String> interests =
                preference.getOptions()
                        .stream()
                        .filter(option ->
                                option.getType()
                                        == EventOptionType.INTEREST
                        )
                        .map(EventOption::getKey)
                        .toList();


        List<String> preferredPeriods =
                preference.getOptions()
                        .stream()
                        .filter(option ->
                                option.getType()
                                        == EventOptionType.PERIOD
                        )
                        .map(EventOption::getKey)
                        .toList();


        List<String> locations =
                preference.getOptions()
                        .stream()
                        .filter(option ->
                                option.getType()
                                        == EventOptionType.LOCATION
                        )
                        .map(EventOption::getKey)
                        .toList();


        return EventPreferencesResponse.builder()

                .id(preference.getId())

                .userId(
                        preference.getUser().getId()
                )

                .interests(interests)

                .preferredPeriods(preferredPeriods)

                .locations(locations)

                .maxDistanceKm(
                        preference.getMaxDistanceKm()
                )

                .minBudget(
                        preference.getMinBudget()
                )

                .maxBudget(
                        preference.getMaxBudget()
                )

                .freeOnly(
                        preference.getFreeOnly()
                )

                .anyBudget(
                        preference.getAnyBudget()
                )

                .useCurrentLocation(
                        preference.getUseCurrentLocation()
                )

                .completed(
                        preference.getCompleted()
                )

                .build();
    }
}