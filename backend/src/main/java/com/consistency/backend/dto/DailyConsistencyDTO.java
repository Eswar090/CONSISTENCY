package com.consistency.backend.dto;

import java.time.LocalDate;

public class DailyConsistencyDTO {
    private LocalDate date;
    private Integer plannedTasks;
    private Integer completedTasks;
    private Double taskCompletionPercentage;
    
    private Integer scheduledHabits;
    private Integer completedHabits;
    private Double habitCompletionPercentage;
    
    private Double dailyConsistency;

    // Getters and Setters
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public Integer getPlannedTasks() { return plannedTasks; }
    public void setPlannedTasks(Integer plannedTasks) { this.plannedTasks = plannedTasks; }

    public Integer getCompletedTasks() { return completedTasks; }
    public void setCompletedTasks(Integer completedTasks) { this.completedTasks = completedTasks; }

    public Double getTaskCompletionPercentage() { return taskCompletionPercentage; }
    public void setTaskCompletionPercentage(Double taskCompletionPercentage) { this.taskCompletionPercentage = taskCompletionPercentage; }

    public Integer getScheduledHabits() { return scheduledHabits; }
    public void setScheduledHabits(Integer scheduledHabits) { this.scheduledHabits = scheduledHabits; }

    public Integer getCompletedHabits() { return completedHabits; }
    public void setCompletedHabits(Integer completedHabits) { this.completedHabits = completedHabits; }

    public Double getHabitCompletionPercentage() { return habitCompletionPercentage; }
    public void setHabitCompletionPercentage(Double habitCompletionPercentage) { this.habitCompletionPercentage = habitCompletionPercentage; }

    public Double getDailyConsistency() { return dailyConsistency; }
    public void setDailyConsistency(Double dailyConsistency) { this.dailyConsistency = dailyConsistency; }
}
