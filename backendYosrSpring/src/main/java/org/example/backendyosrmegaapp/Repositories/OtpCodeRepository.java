package org.example.backendyosrmegaapp.Repositories;


import org.example.backendyosrmegaapp.entities.OtpCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface OtpCodeRepository
        extends JpaRepository<OtpCode,Long> {


    Optional<OtpCode> findByUserIdAndCode(
            Long userId,
            String code
    );


}
