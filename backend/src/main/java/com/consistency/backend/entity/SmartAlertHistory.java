package com.consistency.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "smart_alert_history", indexes = {
    @Index(name = "idx_alert_history_user_date", columnList = "user_id, alert_date")
})
public class SmartAlertHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "alert_date", nullable = false)
    private LocalDate alertDate;

    @Column(name = "sent_at", nullable = false)
    private LocalDateTime sentAt;

    @Column(name = "progress_percentage")
    private Double progressPercentage;

    @Column(name = "remaining_tasks", nullable = false)
    private Integer remainingTasks = 0;

    @Column(name = "remaining_habits", nullable = false)
    private Integer remainingHabits = 0;

    @Column(name = "message_type", nullable = false, length = 50)
    private String messageType; // "ALERT" or "TEST"

    @Column(name = "slot_time")
    private LocalTime slotTime;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public LocalDate getAlertDate() { return alertDate; }
    public void setAlertDate(LocalDate alertDate) { this.alertDate = alertDate; }

    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }

    public Double getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(Double progressPercentage) { this.progressPercentage = progressPercentage; }

    public Integer getRemainingTasks() { return remainingTasks; }
    public void setRemainingTasks(Integer remainingTasks) { this.remainingTasks = remainingTasks; }

    public Integer getRemainingHabits() { return remainingHabits; }
    public void setRemainingHabits(Integer remainingHabits) { this.remainingHabits = remainingHabits; }

    public String getMessageType() { return messageType; }
    public void setMessageType(String messageType) { this.messageType = messageType; }

    public LocalTime getSlotTime() { return slotTime; }
    public void setSlotTime(LocalTime slotTime) { this.slotTime = slotTime; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
