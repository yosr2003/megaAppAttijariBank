package org.example.backendyosrmegaapp.Services;

import org.example.backendyosrmegaapp.entities.EventPreferencesRequest;
import org.example.backendyosrmegaapp.entities.EventPreferencesResponse;

public interface EventPreferenceService {

    EventPreferencesResponse getPreferences(Long userId);

    EventPreferencesResponse savePreferences(
            Long userId,
            EventPreferencesRequest request
    );

    EventPreferencesResponse updatePreferences(
            Long userId,
            EventPreferencesRequest request
    );

    void deletePreferences(Long userId);
}