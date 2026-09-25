package com.consistency.backend.service;

import com.consistency.backend.dto.AggregateConsistencyDTO;
import com.consistency.backend.dto.DailyConsistencyDTO;
import com.consistency.backend.dto.HabitStatsDTO;
import com.consistency.backend.entity.*;
import com.consistency.backend.exception.ResourceNotFoundException;
import com.consistency.backend.repository.HabitLogRepository;
import com.consistency.backend.repository.HabitRepository;
import com.consistency.backend.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ConsistencyService {

    private final TaskRepository taskRepository;
    private final HabitRepository habitRepository;
    private final HabitLogRepository habitLogRepository;
    private final CurrentUserService currentUserService;

    public ConsistencyService(TaskRepository taskRepository, HabitRepository habitRepository, HabitLogRepository habitLogRepository, CurrentUserService currentUserService) {
        this.taskRepository = taskRepository;
        this.habitRepository = habitRepository;
        this.habitLogRepository = habitLogRepository;
        this.currentUserService = currentUserService;
    }

    private boolean isHabitScheduledForDate(Habit habit, LocalDate date) {
        if (date.isBefore(habit.getStartDate())) return false;
        
        if (habit.getArchivedAt() != null && date.isAfter(habit.getArchivedAt())) return false;
        
        // Never evaluate future dates
        if (date.isAfter(LocalDate.now())) return false;

        if (habit.getFrequencyType() == HabitFrequency.DAILY) return true;

        if (habit.getFrequencyType() == HabitFrequency.SELECTED_DAYS && habit.getSelectedDays() != null) {
            String dayName = date.getDayOfWeek().name();
            return habit.getSelectedDays().contains(dayName);
        }

        return false;
    }

    public DailyConsistencyDTO calculateDailyConsistency(LocalDate date) {
        if (date.isAfter(LocalDate.now())) {
            DailyConsistencyDTO dto = new DailyConsistencyDTO();
            dto.setDate(date);
            return dto;
        }

        User user = currentUserService.getCurrentUser();
        List<Task> tasks = taskRepository.findByUserIdAndPlannedDateOrderByCreatedTimeAsc(user.getId(), date);
        List<Habit> userHabits = habitRepository.findByUserId(user.getId());
        List<HabitLog> logs = habitLogRepository.findByHabitUserIdAndDateBetween(user.getId(), date, date);
        
        return calculateDailyConsistencyInternal(date, tasks, userHabits, logs);
    }

    /**
     * Calculate daily consistency for a given userId without requiring an authenticated security context.
     * Used by SmartAlertScheduler which runs as a scheduled background task.
     */
    public DailyConsistencyDTO calculateDailyConsistencyForUser(Long userId, LocalDate date) {
        if (date.isAfter(LocalDate.now())) {
            DailyConsistencyDTO dto = new DailyConsistencyDTO();
            dto.setDate(date);
            return dto;
        }
        List<Task> tasks = taskRepository.findByUserIdAndPlannedDateOrderByCreatedTimeAsc(userId, date);
        List<Habit> userHabits = habitRepository.findByUserId(userId);
        List<HabitLog> logs = habitLogRepository.findByHabitUserIdAndDateBetween(userId, date, date);
        return calculateDailyConsistencyInternal(date, tasks, userHabits, logs);
    }

    private DailyConsistencyDTO calculateDailyConsistencyInternal(LocalDate date, List<Task> tasksForDate, List<Habit> userHabits, List<HabitLog> logsForDate) {
        DailyConsistencyDTO dto = new DailyConsistencyDTO();
        dto.setDate(date);

        if (date.isAfter(LocalDate.now())) {
            return dto; 
        }

        // Tasks Calculation
        List<Task> eligibleTasks = tasksForDate.stream()
                .filter(t -> t.getStatus() == TaskStatus.TODO || t.getStatus() == TaskStatus.COMPLETED)
                .collect(Collectors.toList());
        
        if (!eligibleTasks.isEmpty()) {
            long completed = eligibleTasks.stream().filter(t -> t.getStatus() == TaskStatus.COMPLETED).count();
            dto.setPlannedTasks(eligibleTasks.size());
            dto.setCompletedTasks((int) completed);
            dto.setTaskCompletionPercentage((double) completed / eligibleTasks.size() * 100);
        }

        // Habits Calculation
        List<Habit> scheduledHabits = userHabits.stream()
                .filter(h -> isHabitScheduledForDate(h, date))
                .collect(Collectors.toList());

        if (!scheduledHabits.isEmpty()) {
            long completedHabitsCount = scheduledHabits.stream().filter(h -> {
                return logsForDate.stream().anyMatch(l -> l.getHabit().getId().equals(h.getId()) && l.getCompleted());
            }).count();

            dto.setScheduledHabits(scheduledHabits.size());
            dto.setCompletedHabits((int) completedHabitsCount);
            dto.setHabitCompletionPercentage((double) completedHabitsCount / scheduledHabits.size() * 100);
        }

        // Overall Daily Consistency
        if (dto.getTaskCompletionPercentage() != null && dto.getHabitCompletionPercentage() != null) {
            dto.setDailyConsistency((dto.getTaskCompletionPercentage() + dto.getHabitCompletionPercentage()) / 2.0);
        } else if (dto.getTaskCompletionPercentage() != null) {
            dto.setDailyConsistency(dto.getTaskCompletionPercentage());
        } else if (dto.getHabitCompletionPercentage() != null) {
            dto.setDailyConsistency(dto.getHabitCompletionPercentage());
        }

        return dto;
    }

    public AggregateConsistencyDTO calculateAggregateConsistency(LocalDate startDate, LocalDate endDate) {
        AggregateConsistencyDTO dto = new AggregateConsistencyDTO();
        dto.setStartDate(startDate);
        dto.setEndDate(endDate);

        LocalDate effectiveEndDate = endDate.isAfter(LocalDate.now()) ? LocalDate.now() : endDate;

        if (startDate.isAfter(effectiveEndDate)) {
            return dto;
        }

        User user = currentUserService.getCurrentUser();

        // Fetch everything in bulk for the authenticated user to avoid N+1 queries
        List<Task> allTasksInRange = taskRepository.findByUserIdAndPlannedDateBetweenOrderByCreatedTimeAsc(user.getId(), startDate, effectiveEndDate);
        List<Habit> userHabits = habitRepository.findByUserId(user.getId());
        List<HabitLog> allLogsInRange = habitLogRepository.findByHabitUserIdAndDateBetween(user.getId(), startDate, effectiveEndDate);

        // Aggregate Tasks
        int totalPlannedTasks = 0;
        int totalCompletedTasks = 0;
        
        LocalDate current = startDate;
        while (!current.isAfter(effectiveEndDate)) {
            final LocalDate date = current;
            
            // Filter lists for the specific date in memory
            List<Task> tasksForDate = allTasksInRange.stream()
                    .filter(t -> date.equals(t.getPlannedDate()))
                    .collect(Collectors.toList());
            List<HabitLog> logsForDate = allLogsInRange.stream()
                    .filter(l -> date.equals(l.getDate()))
                    .collect(Collectors.toList());

            DailyConsistencyDTO daily = calculateDailyConsistencyInternal(date, tasksForDate, userHabits, logsForDate);
            dto.getDailyData().add(daily);
            
            if (daily.getPlannedTasks() != null) {
                totalPlannedTasks += daily.getPlannedTasks();
                totalCompletedTasks += daily.getCompletedTasks();
            }
            if (daily.getScheduledHabits() != null) {
                dto.setTotalScheduledHabits(dto.getTotalScheduledHabits() + daily.getScheduledHabits());
                dto.setTotalCompletedHabits(dto.getTotalCompletedHabits() + daily.getCompletedHabits());
            }
            current = current.plusDays(1);
        }

        dto.setTotalPlannedTasks(totalPlannedTasks);
        dto.setTotalCompletedTasks(totalCompletedTasks);

        if (totalPlannedTasks > 0) {
            dto.setTaskExecutionPercentage((double) totalCompletedTasks / totalPlannedTasks * 100);
        }
        
        if (dto.getTotalScheduledHabits() > 0) {
            dto.setHabitConsistencyPercentage((double) dto.getTotalCompletedHabits() / dto.getTotalScheduledHabits() * 100);
        }

        if (dto.getTaskExecutionPercentage() != null && dto.getHabitConsistencyPercentage() != null) {
            dto.setOverallConsistencyPercentage((dto.getTaskExecutionPercentage() + dto.getHabitConsistencyPercentage()) / 2.0);
        } else if (dto.getTaskExecutionPercentage() != null) {
            dto.setOverallConsistencyPercentage(dto.getTaskExecutionPercentage());
        } else if (dto.getHabitConsistencyPercentage() != null) {
            dto.setOverallConsistencyPercentage(dto.getHabitConsistencyPercentage());
        }

        return dto;
    }

    public HabitStatsDTO calculateHabitStats(Long habitId) {
        User user = currentUserService.getCurrentUser();
        Habit habit = habitRepository.findByIdAndUserId(habitId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Habit not found with id " + habitId));

        HabitStatsDTO stats = new HabitStatsDTO();
        stats.setHabitId(habitId);

        LocalDate endDate = LocalDate.now();
        if (habit.getArchivedAt() != null && habit.getArchivedAt().isBefore(endDate)) {
            endDate = habit.getArchivedAt();
        }

        if (habit.getStartDate().isAfter(endDate)) {
            stats.setCurrentStreak(0);
            stats.setLongestStreak(0);
            stats.setCompletionRate(null);
            return stats;
        }

        // Fetch logs for this user habit
        List<HabitLog> logs = habitLogRepository.findByHabitUserIdAndDateBetween(user.getId(), habit.getStartDate(), endDate)
                .stream()
                .filter(l -> l.getHabit().getId().equals(habitId))
                .collect(Collectors.toList());

        int currentStreak = 0;
        int longestStreak = 0;
        int totalScheduled = 0;
        int totalCompleted = 0;

        LocalDate current = habit.getStartDate();
        while (!current.isAfter(endDate)) {
            if (isHabitScheduledForDate(habit, current)) {
                totalScheduled++;
                
                final LocalDate evaluationDate = current;
                boolean isCompleted = logs.stream().anyMatch(l -> l.getDate().equals(evaluationDate) && l.getCompleted());
                
                if (isCompleted) {
                    totalCompleted++;
                    currentStreak++;
                    if (currentStreak > longestStreak) {
                        longestStreak = currentStreak;
                    }
                } else {
                    currentStreak = 0; // broken streak
                }
            }
            current = current.plusDays(1);
        }

        stats.setCurrentStreak(currentStreak);
        stats.setLongestStreak(longestStreak);
        if (totalScheduled > 0) {
            stats.setCompletionRate((double) totalCompleted / totalScheduled * 100);
        }

        return stats;
    }
}
