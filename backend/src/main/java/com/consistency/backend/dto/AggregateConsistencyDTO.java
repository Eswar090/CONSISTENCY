package com.consistency.backend.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.ArrayList;

public class AggregateConsistencyDTO {
    private LocalDate startDate;
    private LocalDate endDate;
    
    private List<DailyConsistencyDTO> dailyData = new ArrayList<>();
    
    private Integer totalPlannedTasks = 0;
    private Integer totalCompletedTasks = 0;
    private Double taskExecutionPercentage;
    
    private Integer totalScheduledHabits = 0;
    private Integer totalCompletedHabits = 0;
    private Double habitConsistencyPercentage;
    
    private Double overallConsistencyPercentage;

    // Getters and Setters
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public Integer getTotalPlannedTasks() { return totalPlannedTasks; }
    public void setTotalPlannedTasks(Integer totalPlannedTasks) { this.totalPlannedTasks = totalPlannedTasks; }

    public Integer getTotalCompletedTasks() { return totalCompletedTasks; }
    public void setTotalCompletedTasks(Integer totalCompletedTasks) { this.totalCompletedTasks = totalCompletedTasks; }

    public Double getTaskExecutionPercentage() { return taskExecutionPercentage; }
    public void setTaskExecutionPercentage(Double taskExecutionPercentage) { this.taskExecutionPercentage = taskExecutionPercentage; }

    public Integer getTotalScheduledHabits() { return totalScheduledHabits; }
    public void setTotalScheduledHabits(Integer totalScheduledHabits) { this.totalScheduledHabits = totalScheduledHabits; }

    public Integer getTotalCompletedHabits() { return totalCompletedHabits; }
    public void setTotalCompletedHabits(Integer totalCompletedHabits) { this.totalCompletedHabits = totalCompletedHabits; }

    public Double getHabitConsistencyPercentage() { return habitConsistencyPercentage; }
    public void setHabitConsistencyPercentage(Double habitConsistencyPercentage) { this.habitConsistencyPercentage = habitConsistencyPercentage; }

    public Double getOverallConsistencyPercentage() { return overallConsistencyPercentage; }
    public void setOverallConsistencyPercentage(Double overallConsistencyPercentage) { this.overallConsistencyPercentage = overallConsistencyPercentage; }

    public List<DailyConsistencyDTO> getDailyData() { return dailyData; }
    public void setDailyData(List<DailyConsistencyDTO> dailyData) { this.dailyData = dailyData; }
}
