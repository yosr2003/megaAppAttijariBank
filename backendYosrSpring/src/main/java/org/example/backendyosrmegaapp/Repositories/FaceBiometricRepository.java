package org.example.backendyosrmegaapp.Repositories;

import org.example.backendyosrmegaapp.entities.FaceBiometric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FaceBiometricRepository
        extends JpaRepository<FaceBiometric, Long> {

    Optional<FaceBiometric> findByUser_Id(Long userId);

}
