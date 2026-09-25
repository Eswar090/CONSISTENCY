package com.consistency.backend.dto;

import com.consistency.backend.entity.SessionStatus;
import com.consistency.backend.entity.SessionType;

import java.time.LocalDateTime;

public class FocusSessionDTO {
    private Long id;
    private Long taskId;
    private String taskTitle;
    private SessionType sessionType;
    private Integer durationMinutes;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private SessionStatus status;

    public FocusSessionDTO() {}

    public FocusSessionDTO(Long id, Long taskId, String taskTitle, SessionType sessionType, Integer durationMinutes, LocalDateTime startedAt, LocalDateTime completedAt, SessionStatus status) {
        this.id = id;
        this.taskId = taskId;
        this.taskTitle = taskTitle;
        this.sessionType = sessionType;
        this.durationMinutes = durationMinutes;
        this.startedAt = startedAt;
        this.completedAt = completedAt;
        this.status = status;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getTaskId() { return taskId; }
    public void setTaskId(Long taskId) { this.taskId = taskId; }

    public String getTaskTitle() { return taskTitle; }
    public void setTaskTitle(String taskTitle) { this.taskTitle = taskTitle; }

    public SessionType getSessionType() { return sessionType; }
    public void setSessionType(SessionType sessionType) { this.sessionType = sessionType; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public SessionStatus getStatus() { return status; }
    public void setStatus(SessionStatus status) { this.status = status; }
}
