package com.consistency.backend.dto;

import com.consistency.backend.entity.SessionType;

public class CreateFocusSessionRequest {
    private Long taskId;
    private SessionType sessionType;
    private Integer durationMinutes;

    public Long getTaskId() { return taskId; }
    public void setTaskId(Long taskId) { this.taskId = taskId; }

    public SessionType getSessionType() { return sessionType; }
    public void setSessionType(SessionType sessionType) { this.sessionType = sessionType; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
}
