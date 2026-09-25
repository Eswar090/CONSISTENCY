package com.consistency.backend.repository;

import com.consistency.backend.entity.SmartAlertHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface SmartAlertHistoryRepository extends JpaRepository<SmartAlertHistory, Long> {
    List<SmartAlertHistory> findByUserIdAndAlertDateOrderBySentAtDesc(Long userId, LocalDate alertDate);
    long countByUserIdAndAlertDate(Long userId, LocalDate alertDate);
    Optional<SmartAlertHistory> findTopByUserIdAndAlertDateOrderBySentAtDesc(Long userId, LocalDate alertDate);
    List<SmartAlertHistory> findByUserIdOrderBySentAtDesc(Long userId);
    long countByUserIdAndAlertDateAndMessageType(Long userId, LocalDate alertDate, String messageType);
}
