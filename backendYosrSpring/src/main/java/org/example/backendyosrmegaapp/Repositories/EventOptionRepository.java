package org.example.backendyosrmegaapp.Repositories;

import org.example.backendyosrmegaapp.Enum.EventOptionType;
import org.example.backendyosrmegaapp.entities.EventOption;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EventOptionRepository
        extends JpaRepository<EventOption, Long> {

    Optional<EventOption> findByKey(String key);

    List<EventOption> findByKeyIn(List<String> keys);

    List<EventOption> findByTypeAndActiveTrueOrderByDisplayOrderAsc(
            EventOptionType type
    );

    List<EventOption> findByActiveTrueOrderByTypeAscDisplayOrderAsc();
}
