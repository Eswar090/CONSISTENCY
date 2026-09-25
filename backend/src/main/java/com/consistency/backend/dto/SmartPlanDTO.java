package com.consistency.backend.dto;

import java.time.LocalDate;
import java.util.List;

public class SmartPlanDTO {
    private LocalDate date;
    private int plannedTaskCount;
    private Double recentAverageCompletedTasks;
    private int planningCapacity;
    private String workloadStatus;
    private List<GoalDTO> activeGoals;
    private List<SmartPlanTaskDTO> recommendedTasks;
    private List<String> warnings;

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public int getPlannedTaskCount() { return plannedTaskCount; }
    public void setPlannedTaskCount(int plannedTaskCount) { this.plannedTaskCount = plannedTaskCount; }
    public Double getRecentAverageCompletedTasks() { return recentAverageCompletedTasks; }
    public void setRecentAverageCompletedTasks(Double recentAverageCompletedTasks) { this.recentAverageCompletedTasks = recentAverageCompletedTasks; }
    public int getPlanningCapacity() { return planningCapacity; }
    public void setPlanningCapacity(int planningCapacity) { this.planningCapacity = planningCapacity; }
    public String getWorkloadStatus() { return workloadStatus; }
    public void setWorkloadStatus(String workloadStatus) { this.workloadStatus = workloadStatus; }
    public List<GoalDTO> getActiveGoals() { return activeGoals; }
    public void setActiveGoals(List<GoalDTO> activeGoals) { this.activeGoals = activeGoals; }
    public List<SmartPlanTaskDTO> getRecommendedTasks() { return recommendedTasks; }
    public void setRecommendedTasks(List<SmartPlanTaskDTO> recommendedTasks) { this.recommendedTasks = recommendedTasks; }
    public List<String> getWarnings() { return warnings; }
    public void setWarnings(List<String> warnings) { this.warnings = warnings; }
}
