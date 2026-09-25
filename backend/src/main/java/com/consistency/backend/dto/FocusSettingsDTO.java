package com.consistency.backend.dto;

public class FocusSettingsDTO {
    private Integer focusMinutes;
    private Integer shortBreakMinutes;
    private Integer longBreakMinutes;
    private Integer sessionsBeforeLongBreak;

    public FocusSettingsDTO() {}

    public FocusSettingsDTO(Integer focusMinutes, Integer shortBreakMinutes, Integer longBreakMinutes, Integer sessionsBeforeLongBreak) {
        this.focusMinutes = focusMinutes;
        this.shortBreakMinutes = shortBreakMinutes;
        this.longBreakMinutes = longBreakMinutes;
        this.sessionsBeforeLongBreak = sessionsBeforeLongBreak;
    }

    public Integer getFocusMinutes() { return focusMinutes; }
    public void setFocusMinutes(Integer focusMinutes) { this.focusMinutes = focusMinutes; }

    public Integer getShortBreakMinutes() { return shortBreakMinutes; }
    public void setShortBreakMinutes(Integer shortBreakMinutes) { this.shortBreakMinutes = shortBreakMinutes; }

    public Integer getLongBreakMinutes() { return longBreakMinutes; }
    public void setLongBreakMinutes(Integer longBreakMinutes) { this.longBreakMinutes = longBreakMinutes; }

    public Integer getSessionsBeforeLongBreak() { return sessionsBeforeLongBreak; }
    public void setSessionsBeforeLongBreak(Integer sessionsBeforeLongBreak) { this.sessionsBeforeLongBreak = sessionsBeforeLongBreak; }
}
