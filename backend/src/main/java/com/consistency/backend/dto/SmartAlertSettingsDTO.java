package com.consistency.backend.dto;

public class SmartAlertSettingsDTO {

    private Boolean enabled;
    private String mobileNumberMasked; // e.g. "+91******1234" or null
    private Boolean mobileVerified;
    private Double progressThreshold;
    private String startTime;  // "HH:mm"
    private String endTime;    // "HH:mm"
    private Integer repeatIntervalMinutes;
    private Integer maxAlertsPerDay;
    private Boolean smsConfigured;

    public Boolean getEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }

    public String getMobileNumberMasked() { return mobileNumberMasked; }
    public void setMobileNumberMasked(String mobileNumberMasked) { this.mobileNumberMasked = mobileNumberMasked; }

    public Boolean getMobileVerified() { return mobileVerified; }
    public void setMobileVerified(Boolean mobileVerified) { this.mobileVerified = mobileVerified; }

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

    public Boolean getSmsConfigured() { return smsConfigured; }
    public void setSmsConfigured(Boolean smsConfigured) { this.smsConfigured = smsConfigured; }
}
