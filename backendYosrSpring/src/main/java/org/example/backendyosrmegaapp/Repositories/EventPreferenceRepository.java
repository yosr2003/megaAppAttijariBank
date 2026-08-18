package org.example.backendyosrmegaapp.Repositories;



import org.example.backendyosrmegaapp.entities.EventPreference;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EventPreferenceRepository
        extends JpaRepository<EventPreference, Long> {

    Optional<EventPreference> findByUserId(Long userId);

    boolean existsByUserId(Long userId);
}