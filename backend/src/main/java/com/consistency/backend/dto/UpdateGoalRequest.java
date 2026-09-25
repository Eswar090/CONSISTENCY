package com.consistency.backend.dto;

import com.consistency.backend.entity.GoalStatus;

public class UpdateGoalRequest {
    private String title;
    private String description;
    private Double targetValue;
    private Double currentValue; // Important for MANUAL goals
    private java.time.LocalDate targetDate;
    private GoalStatus status;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Double getTargetValue() { return targetValue; }
    public void setTargetValue(Double targetValue) { this.targetValue = targetValue; }
    public Double getCurrentValue() { return currentValue; }
    public void setCurrentValue(Double currentValue) { this.currentValue = currentValue; }
    public java.time.LocalDate getTargetDate() { return targetDate; }
    public void setTargetDate(java.time.LocalDate targetDate) { this.targetDate = targetDate; }
    public GoalStatus getStatus() { return status; }
    public void setStatus(GoalStatus status) { this.status = status; }
}
