package com.consistency.backend.controller;

import com.consistency.backend.entity.Habit;
import com.consistency.backend.entity.HabitLog;
import com.consistency.backend.service.HabitService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/habits")
public class HabitController {

    private final HabitService habitService;

    public HabitController(HabitService habitService) {
        this.habitService = habitService;
    }

    @GetMapping
    public ResponseEntity<List<Habit>> getActiveHabits() {
        return ResponseEntity.ok(habitService.getActiveHabits());
    }

    @PostMapping
    public ResponseEntity<Habit> createHabit(@RequestBody Habit habit) {
        return new ResponseEntity<>(habitService.createHabit(habit), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Habit> updateHabit(@PathVariable Long id, @RequestBody Habit habit) {
        return ResponseEntity.ok(habitService.updateHabit(id, habit));
    }

    @PatchMapping("/{id}/archive")
    public ResponseEntity<Void> archiveHabit(@PathVariable Long id) {
        habitService.archiveHabit(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/logs")
    public ResponseEntity<List<HabitLog>> getHabitLogs(
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(habitService.getHabitLogsByDateRange(startDate, endDate));
    }

    @PostMapping("/{id}/logs")
    public ResponseEntity<HabitLog> toggleHabitLog(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        String dateStr = (String) body.get("date");
        Boolean completed = (Boolean) body.get("completed");
        LocalDate date = LocalDate.parse(dateStr);
        return ResponseEntity.ok(habitService.toggleHabitLog(id, date, completed));
    }
}
