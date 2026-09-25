package com.consistency.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "focus_settings", uniqueConstraints = {
    @UniqueConstraint(columnNames = "user_id")
})
public class FocusSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "focus_minutes", nullable = false)
    private Integer focusMinutes = 25;

    @Column(name = "short_break_minutes", nullable = false)
    private Integer shortBreakMinutes = 5;

    @Column(name = "long_break_minutes", nullable = false)
    private Integer longBreakMinutes = 15;

    @Column(name = "sessions_before_long_break", nullable = false)
    private Integer sessionsBeforeLongBreak = 4;

    public FocusSettings() {}

    public FocusSettings(User user, Integer focusMinutes, Integer shortBreakMinutes, Integer longBreakMinutes, Integer sessionsBeforeLongBreak) {
        this.user = user;
        this.focusMinutes = focusMinutes;
        this.shortBreakMinutes = shortBreakMinutes;
        this.longBreakMinutes = longBreakMinutes;
        this.sessionsBeforeLongBreak = sessionsBeforeLongBreak;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Integer getFocusMinutes() { return focusMinutes; }
    public void setFocusMinutes(Integer focusMinutes) { this.focusMinutes = focusMinutes; }

    public Integer getShortBreakMinutes() { return shortBreakMinutes; }
    public void setShortBreakMinutes(Integer shortBreakMinutes) { this.shortBreakMinutes = shortBreakMinutes; }

    public Integer getLongBreakMinutes() { return longBreakMinutes; }
    public void setLongBreakMinutes(Integer longBreakMinutes) { this.longBreakMinutes = longBreakMinutes; }

    public Integer getSessionsBeforeLongBreak() { return sessionsBeforeLongBreak; }
    public void setSessionsBeforeLongBreak(Integer sessionsBeforeLongBreak) { this.sessionsBeforeLongBreak = sessionsBeforeLongBreak; }
}
