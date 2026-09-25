package com.consistency.backend.dto;

import java.time.LocalDate;
import java.util.List;

public class ProductivityContextDTO {

    private LocalDate date;
    private String period;
    private TaskSummary tasks;
    private HabitSummary habits;
    private ConsistencySummary consistency;
    private Double planningAccuracy;
    private FocusSummary focus;
    private List<String> todayTaskList;
    private List<HabitStatsDTO> habitPerformance;
    private SmartPlanDTO smartPlan;
    private List<GoalDTO> goals;

    public ProductivityContextDTO() {}

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public String getPeriod() { return period; }
    public void setPeriod(String period) { this.period = period; }

    public TaskSummary getTasks() { return tasks; }
    public void setTasks(TaskSummary tasks) { this.tasks = tasks; }

    public HabitSummary getHabits() { return habits; }
    public void setHabits(HabitSummary habits) { this.habits = habits; }

    public ConsistencySummary getConsistency() { return consistency; }
    public void setConsistency(ConsistencySummary consistency) { this.consistency = consistency; }

    public Double getPlanningAccuracy() { return planningAccuracy; }
    public void setPlanningAccuracy(Double planningAccuracy) { this.planningAccuracy = planningAccuracy; }

    public FocusSummary getFocus() { return focus; }
    public void setFocus(FocusSummary focus) { this.focus = focus; }

    public List<String> getTodayTaskList() { return todayTaskList; }
    public void setTodayTaskList(List<String> todayTaskList) { this.todayTaskList = todayTaskList; }

    public List<HabitStatsDTO> getHabitPerformance() { return habitPerformance; }
    public SmartPlanDTO getSmartPlan() { return smartPlan; }
    public void setSmartPlan(SmartPlanDTO smartPlan) { this.smartPlan = smartPlan; }
    public List<GoalDTO> getGoals() { return goals; }
    public void setGoals(List<GoalDTO> goals) { this.goals = goals; }
    public void setHabitPerformance(List<HabitStatsDTO> habitPerformance) { this.habitPerformance = habitPerformance; }

    public static class TaskSummary {
        private Integer planned;
        private Integer completed;
        private Double completionPercentage;

        public TaskSummary() {}

        public TaskSummary(Integer planned, Integer completed, Double completionPercentage) {
            this.planned = planned;
            this.completed = completed;
            this.completionPercentage = completionPercentage;
        }

        public Integer getPlanned() { return planned; }
        public void setPlanned(Integer planned) { this.planned = planned; }

        public Integer getCompleted() { return completed; }
        public void setCompleted(Integer completed) { this.completed = completed; }

        public Double getCompletionPercentage() { return completionPercentage; }
        public void setCompletionPercentage(Double completionPercentage) { this.completionPercentage = completionPercentage; }
    }

    public static class HabitSummary {
        private Integer scheduledOccurrences;
        private Integer completedOccurrences;
        private Double completionPercentage;

        public HabitSummary() {}

        public HabitSummary(Integer scheduledOccurrences, Integer completedOccurrences, Double completionPercentage) {
            this.scheduledOccurrences = scheduledOccurrences;
            this.completedOccurrences = completedOccurrences;
            this.completionPercentage = completionPercentage;
        }

        public Integer getScheduledOccurrences() { return scheduledOccurrences; }
        public void setScheduledOccurrences(Integer scheduledOccurrences) { this.scheduledOccurrences = scheduledOccurrences; }

        public Integer getCompletedOccurrences() { return completedOccurrences; }
        public void setCompletedOccurrences(Integer completedOccurrences) { this.completedOccurrences = completedOccurrences; }

        public Double getCompletionPercentage() { return completionPercentage; }
        public void setCompletionPercentage(Double completionPercentage) { this.completionPercentage = completionPercentage; }
    }

    public static class ConsistencySummary {
        private Double current;
        private Double average;
        private Integer currentStreak;
        private Integer longestStreak;

        public ConsistencySummary() {}

        public ConsistencySummary(Double current, Double average, Integer currentStreak, Integer longestStreak) {
            this.current = current;
            this.average = average;
            this.currentStreak = currentStreak;
            this.longestStreak = longestStreak;
        }

        public Double getCurrent() { return current; }
        public void setCurrent(Double current) { this.current = current; }

        public Double getAverage() { return average; }
        public void setAverage(Double average) { this.average = average; }

        public Integer getCurrentStreak() { return currentStreak; }
        public void setCurrentStreak(Integer currentStreak) { this.currentStreak = currentStreak; }

        public Integer getLongestStreak() { return longestStreak; }
        public void setLongestStreak(Integer longestStreak) { this.longestStreak = longestStreak; }
    }

    public static class FocusSummary {
        private Long completedSessions;
        private Long focusedMinutes;

        public FocusSummary() {}

        public FocusSummary(Long completedSessions, Long focusedMinutes) {
            this.completedSessions = completedSessions;
            this.focusedMinutes = focusedMinutes;
        }

        public Long getCompletedSessions() { return completedSessions; }
        public void setCompletedSessions(Long completedSessions) { this.completedSessions = completedSessions; }

        public Long getFocusedMinutes() { return focusedMinutes; }
        public void setFocusedMinutes(Long focusedMinutes) { this.focusedMinutes = focusedMinutes; }
    }
}

