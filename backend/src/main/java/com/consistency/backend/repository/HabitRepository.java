package com.consistency.backend.repository;

import com.consistency.backend.entity.Habit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HabitRepository extends JpaRepository<Habit, Long> {
    List<Habit> findByUserIdAndActiveTrueOrderByIdAsc(Long userId);

    List<Habit> findByUserId(Long userId);

    java.util.Optional<Habit> findByIdAndUserId(Long id, Long userId);
}
