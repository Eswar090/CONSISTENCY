package com.consistency.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "reminders", indexes = { @Index(name = "idx_reminder_user_time", columnList = "user_id, reminder_time") })
public class Reminder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String title;

    private String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "reminder_type", nullable = false)
    private ReminderType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "frequency", nullable = false)
    private ReminderFrequency frequency;

    @Column(name = "reminder_date")
    private LocalDate reminderDate;

    @Column(name = "reminder_time", nullable = false)
    private LocalTime reminderTime;

    @Column(name = "day_of_week")
    private Integer dayOfWeek; // 1 = Monday ... 7 = Sunday (or standard ISO DayOfWeek value)

    @Column(name = "task_id")
    private Long taskId;

    @Column(name = "habit_id")
    private Long habitId;

    @Column(name = "active", nullable = false)
    private Boolean active = true;

    @Column(name = "last_triggered_date")
    private LocalDate lastTriggeredDate;

    public Reminder() {}

    public Reminder(Long userId, String title, String message, ReminderType type, ReminderFrequency frequency,
                    LocalDate reminderDate, LocalTime reminderTime, Integer dayOfWeek, Long taskId, Long habitId, Boolean active) {
        this.userId = userId;
        this.title = title;
        this.message = message;
        this.type = type;
        this.frequency = frequency;
        this.reminderDate = reminderDate;
        this.reminderTime = reminderTime;
        this.dayOfWeek = dayOfWeek;
        this.taskId = taskId;
        this.habitId = habitId;
        this.active = active != null ? active : true;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

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

    public LocalDate getLastTriggeredDate() { return lastTriggeredDate; }
    public void setLastTriggeredDate(LocalDate lastTriggeredDate) { this.lastTriggeredDate = lastTriggeredDate; }
}

