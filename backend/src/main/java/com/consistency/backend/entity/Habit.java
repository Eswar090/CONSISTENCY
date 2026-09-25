package com.consistency.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "habits", indexes = { @Index(name = "idx_habit_user", columnList = "user_id") })
public class Habit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String icon;

    @Enumerated(EnumType.STRING)
    @Column(name = "frequency_type", nullable = false)
    private HabitFrequency frequencyType = HabitFrequency.DAILY;

    @Column(name = "selected_days")
    private String selectedDays; // e.g., "MONDAY,WEDNESDAY,FRIDAY"

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(name = "archived_at")
    private LocalDate archivedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
    
    public HabitFrequency getFrequencyType() { return frequencyType; }
    public void setFrequencyType(HabitFrequency frequencyType) { this.frequencyType = frequencyType; }
    
    public String getSelectedDays() { return selectedDays; }
    public void setSelectedDays(String selectedDays) { this.selectedDays = selectedDays; }
    
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    
    public LocalDate getArchivedAt() { return archivedAt; }
    public void setArchivedAt(LocalDate archivedAt) { this.archivedAt = archivedAt; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}

