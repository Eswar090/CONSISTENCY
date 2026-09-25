package com.consistency.backend.service;

import com.consistency.backend.dto.AnalyticsResponseDTO;
import com.consistency.backend.dto.DailyConsistencyDTO;
import com.consistency.backend.dto.HabitStatsDTO;
import com.consistency.backend.dto.ProductivityContextDTO;
import com.consistency.backend.entity.Habit;
import com.consistency.backend.entity.Task;
import com.consistency.backend.entity.User;
import com.consistency.backend.repository.HabitRepository;
import com.consistency.backend.repository.TaskRepository;
import com.consistency.backend.dto.SmartPlanDTO;
import com.consistency.backend.dto.GoalDTO;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductivityContextService {

    private final ConsistencyService consistencyService;
    private final AnalyticsService analyticsService;
    private final FocusSessionService focusSessionService;
    private final TaskRepository taskRepository;
    private final HabitRepository habitRepository;
    private final CurrentUserService currentUserService;
    private final SmartPlanService smartPlanService;
    private final GoalService goalService;

    public ProductivityContextService(ConsistencyService consistencyService, SmartPlanService smartPlanService, GoalService goalService,
                                      AnalyticsService analyticsService,
                                      FocusSessionService focusSessionService,
                                      TaskRepository taskRepository,
                                      HabitRepository habitRepository,
                                      CurrentUserService currentUserService) {
        this.consistencyService = consistencyService;
        this.analyticsService = analyticsService;
        this.focusSessionService = focusSessionService;
        this.taskRepository = taskRepository;
        this.habitRepository = habitRepository;
        this.currentUserService = currentUserService;
        this.smartPlanService = smartPlanService;
        this.goalService = goalService;
    }

    public ProductivityContextDTO getContextForUser(String message) {
        User user = currentUserService.getCurrentUser();
        LocalDate today = LocalDate.now();

        // Determine timeframe from query message
        LocalDate startDate;
        LocalDate endDate = today;
        String periodName = "This Week";

        String query = message != null ? message.toLowerCase() : "";
        if (query.contains("today")) {
            startDate = today;
            periodName = "Today";
        } else if (query.contains("yesterday")) {
            startDate = today.minusDays(1);
            endDate = today.minusDays(1);
            periodName = "Yesterday";
        } else if (query.contains("this month") || query.contains("month")) {
            startDate = today.withDayOfMonth(1);
            periodName = "This Month";
        } else {
            // Default: This Week (Monday through today)
            startDate = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            periodName = "This Week";
        }

        ProductivityContextDTO context = new ProductivityContextDTO();
        context.setDate(today);
        context.setPeriod(periodName);

        // Fetch Analytics using existing AnalyticsService (which reuses ConsistencyService)
        AnalyticsResponseDTO analytics = analyticsService.getAnalytics(startDate, endDate);

        // Set Task Summary
        context.setTasks(new ProductivityContextDTO.TaskSummary(
                analytics.getPlannedTasks(),
                analytics.getCompletedTasks(),
                analytics.getTaskExecutionPercentage()
        ));

        // Set Habit Summary
        context.setHabits(new ProductivityContextDTO.HabitSummary(
                analytics.getScheduledHabits(),
                analytics.getCompletedHabits(),
                analytics.getHabitConsistencyPercentage()
        ));

        // Calculate Streaks across active habits
        List<Habit> userHabits = habitRepository.findByUserId(user.getId());
        int currentStreakMax = 0;
        int longestStreakMax = 0;

        for (Habit habit : userHabits) {
            HabitStatsDTO stats = consistencyService.calculateHabitStats(habit.getId());
            if (stats.getCurrentStreak() != null && stats.getCurrentStreak() > currentStreakMax) {
                currentStreakMax = stats.getCurrentStreak();
            }
            if (stats.getLongestStreak() != null && stats.getLongestStreak() > longestStreakMax) {
                longestStreakMax = stats.getLongestStreak();
            }
        }

        // Today's Daily Consistency
        DailyConsistencyDTO todayDaily = consistencyService.calculateDailyConsistency(today);

        context.setConsistency(new ProductivityContextDTO.ConsistencySummary(
                todayDaily.getDailyConsistency(),
                analytics.getOverallConsistency(),
                currentStreakMax,
                longestStreakMax
        ));

        // Planning accuracy
        context.setPlanningAccuracy(analytics.getTaskExecutionPercentage());

        // Focus stats
        if (analytics.getFocusStats() != null) {
            context.setFocus(new ProductivityContextDTO.FocusSummary(
                    analytics.getFocusStats().getCompletedSessions(),
                    analytics.getFocusStats().getTotalFocusMinutes()
            ));
        }

        // Today's Task Title List
        List<Task> todayTasks = taskRepository.findByUserIdAndPlannedDateOrderByCreatedTimeAsc(user.getId(), today);
        List<String> taskTitles = todayTasks.stream()
                .map(t -> (t.getStatus() == com.consistency.backend.entity.TaskStatus.COMPLETED ? "[✓] " : "[ ] ") + t.getTitle())
                .collect(Collectors.toList());
        context.setTodayTaskList(taskTitles);

        // Detailed Habit Performance List
        context.setHabitPerformance(analytics.getHabitPerformance());

                // Smart Plan Context
        SmartPlanDTO smartPlan = smartPlanService.generateSmartPlan(today);
        context.setSmartPlan(smartPlan);

        // Active Goals
        List<GoalDTO> goals = goalService.getGoals();
        context.setGoals(goals);

        return context;
    }
}

