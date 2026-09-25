package com.consistency.backend.controller;

import com.consistency.backend.dto.CreateFocusSessionRequest;
import com.consistency.backend.dto.FocusSessionDTO;
import com.consistency.backend.dto.FocusStatsDTO;
import com.consistency.backend.entity.Task;
import com.consistency.backend.service.FocusSessionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/focus")
public class FocusSessionController {

    private final FocusSessionService focusSessionService;

    public FocusSessionController(FocusSessionService focusSessionService) {
        this.focusSessionService = focusSessionService;
    }

    @GetMapping("/tasks/today")
    public ResponseEntity<List<Task>> getTodayTasks() {
        return ResponseEntity.ok(focusSessionService.getTodayTasks());
    }

    @GetMapping("/sessions/today")
    public ResponseEntity<List<FocusSessionDTO>> getTodaySessions() {
        return ResponseEntity.ok(focusSessionService.getTodaySessions());
    }

    @PostMapping("/sessions")
    public ResponseEntity<FocusSessionDTO> startSession(@RequestBody CreateFocusSessionRequest request) {
        FocusSessionDTO created = focusSessionService.startSession(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/sessions/{id}/complete")
    public ResponseEntity<FocusSessionDTO> completeSession(@PathVariable Long id) {
        return ResponseEntity.ok(focusSessionService.completeSession(id));
    }

    @PutMapping("/sessions/{id}/skip")
    public ResponseEntity<FocusSessionDTO> skipSession(@PathVariable Long id) {
        return ResponseEntity.ok(focusSessionService.skipSession(id));
    }

    @GetMapping("/stats/today")
    public ResponseEntity<FocusStatsDTO> getTodayStats() {
        return ResponseEntity.ok(focusSessionService.getTodayStats());
    }
}
