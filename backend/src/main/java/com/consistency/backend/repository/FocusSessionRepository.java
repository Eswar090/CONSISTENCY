package com.consistency.backend.repository;

import com.consistency.backend.entity.FocusSession;
import com.consistency.backend.entity.SessionStatus;
import com.consistency.backend.entity.SessionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FocusSessionRepository extends JpaRepository<FocusSession, Long> {
    List<FocusSession> findByUserIdAndStartedAtBetweenOrderByStartedAtDesc(Long userId, LocalDateTime start, LocalDateTime end);

    List<FocusSession> findByUserIdAndSessionTypeAndStatusAndStartedAtBetween(Long userId, SessionType sessionType, SessionStatus status, LocalDateTime start, LocalDateTime end);

    Optional<FocusSession> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT COALESCE(SUM(fs.durationMinutes), 0) FROM FocusSession fs WHERE fs.user.id = :userId AND fs.sessionType = com.consistency.backend.entity.SessionType.FOCUS AND fs.status = com.consistency.backend.entity.SessionStatus.COMPLETED AND fs.startedAt >= :start AND fs.startedAt <= :end")
    Long sumCompletedFocusMinutes(@org.springframework.data.repository.query.Param("userId") Long userId, @org.springframework.data.repository.query.Param("start") java.time.LocalDateTime start, @org.springframework.data.repository.query.Param("end") java.time.LocalDateTime end);
}


