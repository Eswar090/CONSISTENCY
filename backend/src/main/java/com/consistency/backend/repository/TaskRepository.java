package com.consistency.backend.repository;

import com.consistency.backend.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByUserIdAndPlannedDateOrderByCreatedTimeAsc(Long userId, LocalDate plannedDate);
    
    List<Task> findByUserIdAndPlannedDateBetweenOrderByCreatedTimeAsc(Long userId, LocalDate startDate, LocalDate endDate);

    java.util.Optional<Task> findByIdAndUserId(Long id, Long userId);
}
