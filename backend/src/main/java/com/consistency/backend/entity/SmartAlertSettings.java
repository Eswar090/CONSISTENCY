package com.consistency.backend.entity;

import jakarta.persistence.*;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Entity
@Table(name = "smart_alert_settings", uniqueConstraints = {
    @UniqueConstraint(columnNames = "user_id")
})
public class SmartAlertSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(nullable = false)
    private Boolean enabled = false;

    @Column(name = "progress_threshold", nullable = false)
    private Double progressThreshold = 50.0;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime = LocalTime.of(19, 0);

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime = LocalTime.of(23, 0);

    @Column(name = "repeat_interval_minutes", nullable = false)
    private Integer repeatIntervalMinutes = 60;

    @Column(name = "max_alerts_per_day", nullable = false)
    private Integer maxAlertsPerDay = 4;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Boolean getEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }

    public Double getProgressThreshold() { return progressThreshold; }
    public void setProgressThreshold(Double progressThreshold) { this.progressThreshold = progressThreshold; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public Integer getRepeatIntervalMinutes() { return repeatIntervalMinutes; }
    public void setRepeatIntervalMinutes(Integer repeatIntervalMinutes) { this.repeatIntervalMinutes = repeatIntervalMinutes; }

    public Integer getMaxAlertsPerDay() { return maxAlertsPerDay; }
    public void setMaxAlertsPerDay(Integer maxAlertsPerDay) { this.maxAlertsPerDay = maxAlertsPerDay; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
