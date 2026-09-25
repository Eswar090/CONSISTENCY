package com.consistency.backend.repository;

import com.consistency.backend.entity.FocusSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FocusSettingsRepository extends JpaRepository<FocusSettings, Long> {
    Optional<FocusSettings> findByUserId(Long userId);
}
