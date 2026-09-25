package com.consistency.backend.dto;

import java.time.LocalDate;
import java.util.List;

public class AnalyticsResponseDTO {
    private LocalDate startDate;
    private LocalDate endDate;

    private Double overallConsistency;

    private Integer plannedTasks;
    private Integer completedTasks;
    private Double taskExecutionPercentage;

    private Integer scheduledHabits;
    private Integer completedHabits;
    private Double habitConsistencyPercentage;

    private List<DailyConsistencyDTO> dailyData;
    private List<HabitStatsDTO> habitPerformance;

    private List<AggregateConsistencyDTO> weeklyData;
    private List<AggregateConsistencyDTO> monthlyData;
    
    private Double previousOverallConsistency;
    private FocusStatsDTO focusStats;

    // Getters and Setters
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public Double getOverallConsistency() { return overallConsistency; }
    public void setOverallConsistency(Double overallConsistency) { this.overallConsistency = overallConsistency; }

    public Integer getPlannedTasks() { return plannedTasks; }
    public void setPlannedTasks(Integer plannedTasks) { this.plannedTasks = plannedTasks; }

    public Integer getCompletedTasks() { return completedTasks; }
    public void setCompletedTasks(Integer completedTasks) { this.completedTasks = completedTasks; }

    public Double getTaskExecutionPercentage() { return taskExecutionPercentage; }
    public void setTaskExecutionPercentage(Double taskExecutionPercentage) { this.taskExecutionPercentage = taskExecutionPercentage; }

    public Integer getScheduledHabits() { return scheduledHabits; }
    public void setScheduledHabits(Integer scheduledHabits) { this.scheduledHabits = scheduledHabits; }

    public Integer getCompletedHabits() { return completedHabits; }
    public void setCompletedHabits(Integer completedHabits) { this.completedHabits = completedHabits; }

    public Double getHabitConsistencyPercentage() { return habitConsistencyPercentage; }
    public void setHabitConsistencyPercentage(Double habitConsistencyPercentage) { this.habitConsistencyPercentage = habitConsistencyPercentage; }

    public List<DailyConsistencyDTO> getDailyData() { return dailyData; }
    public void setDailyData(List<DailyConsistencyDTO> dailyData) { this.dailyData = dailyData; }

    public List<HabitStatsDTO> getHabitPerformance() { return habitPerformance; }
    public void setHabitPerformance(List<HabitStatsDTO> habitPerformance) { this.habitPerformance = habitPerformance; }

    public List<AggregateConsistencyDTO> getWeeklyData() { return weeklyData; }
    public void setWeeklyData(List<AggregateConsistencyDTO> weeklyData) { this.weeklyData = weeklyData; }

    public List<AggregateConsistencyDTO> getMonthlyData() { return monthlyData; }
    public void setMonthlyData(List<AggregateConsistencyDTO> monthlyData) { this.monthlyData = monthlyData; }

    public Double getPreviousOverallConsistency() { return previousOverallConsistency; }
    public void setPreviousOverallConsistency(Double previousOverallConsistency) { this.previousOverallConsistency = previousOverallConsistency; }

    public FocusStatsDTO getFocusStats() { return focusStats; }
    public void setFocusStats(FocusStatsDTO focusStats) { this.focusStats = focusStats; }
}
