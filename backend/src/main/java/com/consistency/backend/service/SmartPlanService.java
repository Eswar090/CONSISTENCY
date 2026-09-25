package com.consistency.backend.service;

import com.consistency.backend.dto.AggregateConsistencyDTO;
import com.consistency.backend.dto.GoalDTO;
import com.consistency.backend.dto.SmartPlanDTO;
import com.consistency.backend.dto.SmartPlanTaskDTO;
import com.consistency.backend.entity.GoalStatus;
import com.consistency.backend.entity.Task;
import com.consistency.backend.entity.TaskStatus;
import com.consistency.backend.entity.User;
import com.consistency.backend.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SmartPlanService {

    private final ConsistencyService consistencyService;
    private final TaskRepository taskRepository;
    private final CurrentUserService currentUserService;
    private final GoalService goalService;

    public SmartPlanService(ConsistencyService consistencyService, TaskRepository taskRepository, CurrentUserService currentUserService, GoalService goalService) {
        this.consistencyService = consistencyService;
        this.taskRepository = taskRepository;
        this.currentUserService = currentUserService;
        this.goalService = goalService;
    }

    public SmartPlanDTO generateSmartPlan(LocalDate date) {
        if (date == null) date = LocalDate.now();
        User user = currentUserService.getCurrentUser();

        SmartPlanDTO plan = new SmartPlanDTO();
        plan.setDate(date);

        // 1. Calculate planning capacity based on last 7 days
        LocalDate start = date.minusDays(7);
        LocalDate end = date.minusDays(1);
        AggregateConsistencyDTO last7Days = consistencyService.calculateAggregateConsistency(start, end);
        
        Double recentAvg = 0.0;
        int capacity = 3; // fallback
        if (last7Days.getTotalPlannedTasks() >= 3) { // Requires at least 3 tasks planned in the last week to consider there's "history"
            recentAvg = last7Days.getTotalCompletedTasks() / 7.0;
            capacity = (int) Math.max(1, Math.round(recentAvg));
        }
        
        plan.setRecentAverageCompletedTasks(recentAvg);
        plan.setPlanningCapacity(capacity);

        // 2. Today's planned tasks
        List<Task> todaysTasks = taskRepository.findByUserIdAndPlannedDateOrderByCreatedTimeAsc(user.getId(), date);
        int plannedCount = todaysTasks.size();
        plan.setPlannedTaskCount(plannedCount);

        // 3. Workload status
        if (plannedCount > capacity * 1.5) {
            plan.setWorkloadStatus("HEAVY");
        } else if (plannedCount < capacity * 0.5) {
            plan.setWorkloadStatus("LIGHT");
        } else {
            plan.setWorkloadStatus("BALANCED");
        }

        // 4. Active Goals
        List<GoalDTO> activeGoals = goalService.getGoals().stream()
                .filter(g -> g.getStatus() == GoalStatus.ACTIVE)
                .collect(Collectors.toList());
        plan.setActiveGoals(activeGoals);

        // 5. Recommended tasks (past incomplete tasks + goal driven)
        List<Task> pastIncomplete = taskRepository.findByUserIdAndPlannedDateBetweenOrderByCreatedTimeAsc(user.getId(), date.minusDays(30), date.minusDays(1))
                .stream()
                .filter(t -> t.getStatus() == TaskStatus.TODO)
                .collect(Collectors.toList());
        
        List<SmartPlanTaskDTO> recommended = pastIncomplete.stream().limit(5).map(this::mapTask).collect(Collectors.toList());
        plan.setRecommendedTasks(recommended);

        // 6. Warnings
        List<String> warnings = new ArrayList<>();
        if ("HEAVY".equals(plan.getWorkloadStatus())) {
            warnings.add("Your plan is heavier than your recent completion capacity. Consider moving tasks to tomorrow.");
        } else if ("LIGHT".equals(plan.getWorkloadStatus()) && activeGoals.size() > 0) {
            warnings.add("Your plan is lighter than usual. Review your goals for additional work.");
        }
        if (recentAvg == 0.0) {
            warnings.add("Not enough history to estimate your planning capacity yet. Add a few tasks first.");
        }
        
        for (GoalDTO g : activeGoals) {
            if (g.getDaysRemaining() > 0 && g.getRequiredPace() > 0) {
                warnings.add(g.getTitle() + " needs about " + String.format("%.1f", g.getRequiredPace()) + " " + g.getUnit() + "/day to reach target.");
            }
        }
        plan.setWarnings(warnings);

        return plan;
    }

    private SmartPlanTaskDTO mapTask(Task task) {
        SmartPlanTaskDTO dto = new SmartPlanTaskDTO();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        
        dto.setPlannedDate(task.getPlannedDate());
        dto.setStatus(task.getStatus().name());
        
        return dto;
    }
}

