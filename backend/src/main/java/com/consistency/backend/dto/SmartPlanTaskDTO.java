package com.consistency.backend.dto;

import java.time.LocalDate;

public class SmartPlanTaskDTO {
    private Long id;
    private String title;
    private LocalDate plannedDate;
    private String status;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public LocalDate getPlannedDate() { return plannedDate; }
    public void setPlannedDate(LocalDate plannedDate) { this.plannedDate = plannedDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
