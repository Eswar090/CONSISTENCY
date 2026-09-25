package com.consistency.backend.repository;

import com.consistency.backend.entity.Goal;
import com.consistency.backend.entity.GoalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {
    List<Goal> findByUserIdOrderByTargetDateAsc(Long userId);
    List<Goal> findByUserIdAndStatusOrderByTargetDateAsc(Long userId, GoalStatus status);
    Optional<Goal> findByIdAndUserId(Long id, Long userId);
}
