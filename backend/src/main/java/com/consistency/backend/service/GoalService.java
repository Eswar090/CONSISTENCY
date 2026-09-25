package com.consistency.backend.service;

import com.consistency.backend.dto.AggregateConsistencyDTO;
import com.consistency.backend.dto.CreateGoalRequest;
import com.consistency.backend.dto.GoalDTO;
import com.consistency.backend.dto.UpdateGoalRequest;
import com.consistency.backend.entity.Goal;
import com.consistency.backend.entity.GoalStatus;
import com.consistency.backend.entity.GoalType;
import com.consistency.backend.entity.User;
import com.consistency.backend.exception.ResourceNotFoundException;
import com.consistency.backend.repository.FocusSessionRepository;
import com.consistency.backend.repository.GoalRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GoalService {

    private final GoalRepository goalRepository;
    private final CurrentUserService currentUserService;
    private final ConsistencyService consistencyService;
    private final FocusSessionRepository focusSessionRepository;

    public GoalService(GoalRepository goalRepository, CurrentUserService currentUserService, ConsistencyService consistencyService, FocusSessionRepository focusSessionRepository) {
        this.goalRepository = goalRepository;
        this.currentUserService = currentUserService;
        this.consistencyService = consistencyService;
        this.focusSessionRepository = focusSessionRepository;
    }

    public List<GoalDTO> getGoals() {
        User user = currentUserService.getCurrentUser();
        return goalRepository.findByUserIdOrderByTargetDateAsc(user.getId())
                .stream()
                .map(this::calculateAndMapToDTO)
                .collect(Collectors.toList());
    }

    public GoalDTO getGoalById(Long id) {
        User user = currentUserService.getCurrentUser();
        Goal goal = goalRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));
        return calculateAndMapToDTO(goal);
    }

    public GoalDTO createGoal(CreateGoalRequest request) {
        User user = currentUserService.getCurrentUser();
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Title is required");
        }
        if (request.getTargetValue() == null || request.getTargetValue() <= 0) {
            throw new IllegalArgumentException("Target value must be greater than 0");
        }
        if (request.getStartDate() == null || request.getTargetDate() == null) {
            throw new IllegalArgumentException("Start date and target date are required");
        }
        if (request.getTargetDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("Target date must be after or equal to start date");
        }

        Goal goal = new Goal();
        goal.setUser(user);
        goal.setTitle(request.getTitle());
        goal.setDescription(request.getDescription());
        goal.setGoalType(request.getGoalType() != null ? request.getGoalType() : GoalType.MANUAL);
        goal.setTargetValue(request.getTargetValue());
        goal.setCurrentValue(0.0);
        goal.setUnit(request.getUnit());
        goal.setStartDate(request.getStartDate());
        goal.setTargetDate(request.getTargetDate());
        goal.setStatus(GoalStatus.ACTIVE);

        Goal saved = goalRepository.save(goal);
        return calculateAndMapToDTO(saved);
    }

    public GoalDTO updateGoal(Long id, UpdateGoalRequest request) {
        User user = currentUserService.getCurrentUser();
        Goal goal = goalRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));

        if (request.getTitle() != null) goal.setTitle(request.getTitle());
        if (request.getDescription() != null) goal.setDescription(request.getDescription());
        if (request.getTargetDate() != null) goal.setTargetDate(request.getTargetDate());
        
        if (request.getTargetValue() != null) {
            if (request.getTargetValue() <= 0) throw new IllegalArgumentException("Target value > 0");
            goal.setTargetValue(request.getTargetValue());
        }

        if (goal.getGoalType() == GoalType.MANUAL && request.getCurrentValue() != null) {
            if (request.getCurrentValue() < 0) throw new IllegalArgumentException("Current value cannot be negative");
            goal.setCurrentValue(request.getCurrentValue());
        }

        if (request.getStatus() != null) {
            goal.setStatus(request.getStatus());
        }

        Goal saved = goalRepository.save(goal);
        return calculateAndMapToDTO(saved);
    }

    public void deleteGoal(Long id) {
        User user = currentUserService.getCurrentUser();
        Goal goal = goalRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));
        goalRepository.delete(goal);
    }

    private GoalDTO calculateAndMapToDTO(Goal goal) {
        GoalDTO dto = new GoalDTO();
        dto.setId(goal.getId());
        dto.setTitle(goal.getTitle());
        dto.setDescription(goal.getDescription());
        dto.setGoalType(goal.getGoalType());
        dto.setTargetValue(goal.getTargetValue());
        dto.setUnit(goal.getUnit());
        dto.setStartDate(goal.getStartDate());
        dto.setTargetDate(goal.getTargetDate());
        dto.setStatus(goal.getStatus());
        dto.setCreatedAt(goal.getCreatedAt());
        dto.setUpdatedAt(goal.getUpdatedAt());

        Double currentProgress = goal.getCurrentValue();

        if (goal.getGoalType() != GoalType.MANUAL) {
            currentProgress = fetchCalculatedProgress(goal);
        }

        if (currentProgress == null) currentProgress = 0.0;
        dto.setCurrentValue(currentProgress);

        double percentage = (currentProgress / goal.getTargetValue()) * 100.0;
        if (percentage > 100) percentage = 100.0;
        dto.setProgressPercentage(percentage);

        // Auto complete logic ONLY if it reaches target and is ACTIVE
        if (percentage >= 100 && goal.getStatus() == GoalStatus.ACTIVE) {
            goal.setStatus(GoalStatus.COMPLETED);
            goalRepository.save(goal);
            dto.setStatus(GoalStatus.COMPLETED);
        }

        long daysRem = ChronoUnit.DAYS.between(LocalDate.now(), goal.getTargetDate());
        if (daysRem < 0) daysRem = 0;
        dto.setDaysRemaining(daysRem);

        if (daysRem > 0 && percentage < 100 && goal.getStatus() == GoalStatus.ACTIVE) {
            double required = (goal.getTargetValue() - currentProgress) / (double) daysRem;
            dto.setRequiredPace(required);
        } else {
            dto.setRequiredPace(0.0);
        }

        return dto;
    }

    private Double fetchCalculatedProgress(Goal goal) {
        LocalDate start = goal.getStartDate();
        LocalDate end = LocalDate.now().isAfter(goal.getTargetDate()) ? goal.getTargetDate() : LocalDate.now();
        if (start.isAfter(end)) return 0.0;

        if (goal.getGoalType() == GoalType.FOCUS_MINUTES) {
            Long mins = focusSessionRepository.sumCompletedFocusMinutes(
                    goal.getUser().getId(),
                    start.atStartOfDay(),
                    end.plusDays(1).atStartOfDay().minusNanos(1)
            );
            return mins != null ? mins.doubleValue() : 0.0;
        } else {
            AggregateConsistencyDTO agg = consistencyService.calculateAggregateConsistency(start, end);
            if (goal.getGoalType() == GoalType.TASK_COUNT) {
                return (double) agg.getTotalCompletedTasks();
            } else if (goal.getGoalType() == GoalType.HABIT_DAYS) {
                return (double) agg.getTotalCompletedHabits();
            } else if (goal.getGoalType() == GoalType.CONSISTENCY_PERCENTAGE) {
                return agg.getOverallConsistencyPercentage() != null ? agg.getOverallConsistencyPercentage() : 0.0;
            }
        }
        return 0.0;
    }
}
