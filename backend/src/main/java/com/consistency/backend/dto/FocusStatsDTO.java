package com.consistency.backend.dto;

public class FocusStatsDTO {
    private long completedSessions;
    private long totalFocusMinutes;

    public FocusStatsDTO() {}

    public FocusStatsDTO(long completedSessions, long totalFocusMinutes) {
        this.completedSessions = completedSessions;
        this.totalFocusMinutes = totalFocusMinutes;
    }

    public long getCompletedSessions() { return completedSessions; }
    public void setCompletedSessions(long completedSessions) { this.completedSessions = completedSessions; }

    public long getTotalFocusMinutes() { return totalFocusMinutes; }
    public void setTotalFocusMinutes(long totalFocusMinutes) { this.totalFocusMinutes = totalFocusMinutes; }
}
