package com.consistency.backend.repository;

import com.consistency.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByMobileNumber(String mobileNumber);
    boolean existsByMobileNumberAndMobileVerified(String mobileNumber, Boolean mobileVerified);
    Optional<User> findByMobileNumber(String mobileNumber);
}
