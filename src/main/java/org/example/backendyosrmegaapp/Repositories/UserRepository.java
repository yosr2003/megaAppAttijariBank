package org.example.backendyosrmegaapp.Repositories;

import org.example.backendyosrmegaapp.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface UserRepository extends JpaRepository<User, Long> {


    Optional<User> findByEmail(String email);


    boolean existsByEmail(String email);


    boolean existsByCin(String cin);


    boolean existsByPhoneNumber(String phoneNumber);


}
