package com.consistency.backend.repository;

import com.consistency.backend.model.Reminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReminderRepository extends JpaRepository<Reminder, Long> {

    List<Reminder> findByUserId(Long userId);

    Optional<Reminder> findByIdAndUserId(Long id, Long userId);

    List<Reminder> findByActiveTrue();

    Optional<Reminder> findByTaskIdAndUserId(Long taskId, Long userId);

    Optional<Reminder> findByHabitIdAndUserId(Long habitId, Long userId);
}
