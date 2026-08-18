package org.example.backendyosrmegaapp.Controllers;

import lombok.RequiredArgsConstructor;
import org.example.backendyosrmegaapp.Enum.EventOptionType;
import org.example.backendyosrmegaapp.Repositories.EventOptionRepository;
import org.example.backendyosrmegaapp.entities.EventOption;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/event-preferences/options")
@RequiredArgsConstructor
public class EventPreferenceOptionsController {

    private final EventOptionRepository eventOptionRepository;

    @GetMapping
    public ResponseEntity<?> getOptions() {

        /*
         * =====================================================
         * INTERESTS
         * =====================================================
         */
        List<EventOption> interests =
                eventOptionRepository
                        .findByTypeAndActiveTrueOrderByDisplayOrderAsc(
                                EventOptionType.INTEREST
                        );


        /*
         * =====================================================
         * PERIODS
         * =====================================================
         */
        List<EventOption> periods =
                eventOptionRepository
                        .findByTypeAndActiveTrueOrderByDisplayOrderAsc(
                                EventOptionType.PERIOD
                        );


        /*
         * =====================================================
         * LOCATIONS
         * =====================================================
         */
        List<EventOption> locations =
                eventOptionRepository
                        .findByTypeAndActiveTrueOrderByDisplayOrderAsc(
                                EventOptionType.LOCATION
                        );


        /*
         * =====================================================
         * RESPONSE
         * =====================================================
         *
         * On garde exactement la structure attendue
         * par le frontend.
         */
        return ResponseEntity.ok(
                Map.of(
                        "interests", interests,
                        "periods", periods,
                        "locations", locations
                )
        );
    }
}