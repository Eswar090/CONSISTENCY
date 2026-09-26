package com.consistency.backend.controller;

import com.consistency.backend.dto.CreateReminderRequest;
import com.consistency.backend.dto.ReminderDTO;
import com.consistency.backend.entity.User;
import com.consistency.backend.service.CurrentUserService;
import com.consistency.backend.service.ReminderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/reminders")
public class ReminderController {

    private final ReminderService reminderService;
    private final CurrentUserService currentUserService;

    @Autowired
    public ReminderController(ReminderService reminderService, CurrentUserService currentUserService) {
        this.reminderService = reminderService;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    public ResponseEntity<List<ReminderDTO>> getReminders() {
        User user = currentUserService.getCurrentUser();
        List<ReminderDTO> reminders = reminderService.getUserReminders(user.getId());
        return ResponseEntity.ok(reminders);
    }

    @GetMapping("/task/{taskId}")
    public ResponseEntity<ReminderDTO> getReminderForTask(@PathVariable Long taskId) {
        User user = currentUserService.getCurrentUser();
        Optional<ReminderDTO> reminder = reminderService.getReminderForTask(taskId, user.getId());
        return reminder.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/habit/{habitId}")
    public ResponseEntity<ReminderDTO> getReminderForHabit(@PathVariable Long habitId) {
        User user = currentUserService.getCurrentUser();
        Optional<ReminderDTO> reminder = reminderService.getReminderForHabit(habitId, user.getId());
        return reminder.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ReminderDTO> createOrUpdateReminder(@RequestBody CreateReminderRequest request) {
        User user = currentUserService.getCurrentUser();
        ReminderDTO created = reminderService.createOrUpdateReminder(user.getId(), request);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReminderDTO> updateReminder(@PathVariable Long id, @RequestBody CreateReminderRequest request) {
        User user = currentUserService.getCurrentUser();
        ReminderDTO updated = reminderService.updateReminder(id, user.getId(), request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteReminder(@PathVariable Long id) {
        User user = currentUserService.getCurrentUser();
        reminderService.deleteReminder(id, user.getId());
        return ResponseEntity.ok(Map.of("message", "Reminder deleted successfully"));
    }
}
