package com.consistency.backend.repository;

import com.consistency.backend.entity.SmartAlertSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SmartAlertSettingsRepository extends JpaRepository<SmartAlertSettings, Long> {
    Optional<SmartAlertSettings> findByUserId(Long userId);
    List<SmartAlertSettings> findByEnabledTrue();
}
