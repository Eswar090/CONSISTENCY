package com.consistency.backend.repository;

import com.consistency.backend.entity.HabitLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface HabitLogRepository extends JpaRepository<HabitLog, Long> {
    Optional<HabitLog> findByHabitIdAndHabitUserIdAndDate(Long habitId, Long userId, LocalDate date);
    
    List<HabitLog> findByHabitUserIdAndDateBetween(Long userId, LocalDate startDate, LocalDate endDate);
}
