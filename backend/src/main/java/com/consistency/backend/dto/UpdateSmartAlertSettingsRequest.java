package com.consistency.backend.dto;

public class UpdateSmartAlertSettingsRequest {

    private Boolean enabled;
    private Double progressThreshold; // 1-100
    private String startTime;         // "HH:mm"
    private String endTime;           // "HH:mm"
    private Integer repeatIntervalMinutes; // 30, 60, or 120
    private Integer maxAlertsPerDay;  // 1-5

    public Boolean getEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }

    public Double getProgressThreshold() { return progressThreshold; }
    public void setProgressThreshold(Double progressThreshold) { this.progressThreshold = progressThreshold; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    public Integer getRepeatIntervalMinutes() { return repeatIntervalMinutes; }
    public void setRepeatIntervalMinutes(Integer repeatIntervalMinutes) { this.repeatIntervalMinutes = repeatIntervalMinutes; }

    public Integer getMaxAlertsPerDay() { return maxAlertsPerDay; }
    public void setMaxAlertsPerDay(Integer maxAlertsPerDay) { this.maxAlertsPerDay = maxAlertsPerDay; }
}
