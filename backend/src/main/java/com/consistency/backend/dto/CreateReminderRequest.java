package com.consistency.backend.dto;

import com.consistency.backend.model.ReminderFrequency;
import com.consistency.backend.model.ReminderType;

import java.time.LocalDate;
import java.time.LocalTime;

public class CreateReminderRequest {

    private String title;
    private String message;
    private ReminderType type;
    private ReminderFrequency frequency;
    private LocalDate reminderDate;
    private LocalTime reminderTime;
    private Integer dayOfWeek;
    private Long taskId;
    private Long habitId;
    private Boolean active = true;

    public CreateReminderRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public ReminderType getType() { return type; }
    public void setType(ReminderType type) { this.type = type; }

    public ReminderFrequency getFrequency() { return frequency; }
    public void setFrequency(ReminderFrequency frequency) { this.frequency = frequency; }

    public LocalDate getReminderDate() { return reminderDate; }
    public void setReminderDate(LocalDate reminderDate) { this.reminderDate = reminderDate; }

    public LocalTime getReminderTime() { return reminderTime; }
    public void setReminderTime(LocalTime reminderTime) { this.reminderTime = reminderTime; }

    public Integer getDayOfWeek() { return dayOfWeek; }
    public void setDayOfWeek(Integer dayOfWeek) { this.dayOfWeek = dayOfWeek; }

    public Long getTaskId() { return taskId; }
    public void setTaskId(Long taskId) { this.taskId = taskId; }

    public Long getHabitId() { return habitId; }
    public void setHabitId(Long habitId) { this.habitId = habitId; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
