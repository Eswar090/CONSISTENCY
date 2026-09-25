package com.consistency.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class SmartAlertHistoryDTO {

    private Long id;
    private LocalDate alertDate;
    private LocalDateTime sentAt;
    private Double progressPercentage;
    private Integer remainingTasks;
    private Integer remainingHabits;
    private String messageType;

    public SmartAlertHistoryDTO() {}

    public SmartAlertHistoryDTO(com.consistency.backend.entity.SmartAlertHistory h) {
        this.id = h.getId();
        this.alertDate = h.getAlertDate();
        this.sentAt = h.getSentAt();
        this.progressPercentage = h.getProgressPercentage();
        this.remainingTasks = h.getRemainingTasks();
        this.remainingHabits = h.getRemainingHabits();
        this.messageType = h.getMessageType();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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
}
