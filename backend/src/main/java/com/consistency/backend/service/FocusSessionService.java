package com.consistency.backend.service;

import com.consistency.backend.dto.CreateFocusSessionRequest;
import com.consistency.backend.dto.FocusSessionDTO;
import com.consistency.backend.dto.FocusStatsDTO;
import com.consistency.backend.entity.*;
import com.consistency.backend.exception.ResourceNotFoundException;
import com.consistency.backend.repository.FocusSessionRepository;
import com.consistency.backend.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FocusSessionService {

    private final FocusSessionRepository focusSessionRepository;
    private final TaskRepository taskRepository;
    private final CurrentUserService currentUserService;
    private final NotificationService notificationService;

    public FocusSessionService(FocusSessionRepository focusSessionRepository, TaskRepository taskRepository, CurrentUserService currentUserService, NotificationService notificationService) {
        this.focusSessionRepository = focusSessionRepository;
        this.taskRepository = taskRepository;
        this.currentUserService = currentUserService;
        this.notificationService = notificationService;
    }

    public List<Task> getTodayTasks() {
        User user = currentUserService.getCurrentUser();
        return taskRepository.findByUserIdAndPlannedDateOrderByCreatedTimeAsc(user.getId(), LocalDate.now());
    }

    public FocusSessionDTO startSession(CreateFocusSessionRequest request) {
        User user = currentUserService.getCurrentUser();
        
        Task task = null;
        if (request.getTaskId() != null) {
            task = taskRepository.findByIdAndUserId(request.getTaskId(), user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Task not found or unauthorized"));
        }

        FocusSession session = new FocusSession();
        session.setUser(user);
        session.setTask(task);
        session.setSessionType(request.getSessionType() != null ? request.getSessionType() : SessionType.FOCUS);
        session.setDurationMinutes(request.getDurationMinutes() != null ? request.getDurationMinutes() : 25);
        session.setStartedAt(LocalDateTime.now());
        session.setStatus(SessionStatus.CANCELLED); // Temporary status until completed/skipped

        FocusSession saved = focusSessionRepository.save(session);
        return mapToDTO(saved);
    }

    public FocusSessionDTO completeSession(Long id) {
        User user = currentUserService.getCurrentUser();
        FocusSession session = focusSessionRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Focus session not found"));

        session.setStatus(SessionStatus.COMPLETED);
        session.setCompletedAt(LocalDateTime.now());

        FocusSession saved = focusSessionRepository.save(session);

        // Generate completion notification
        try {
            if (session.getSessionType() == SessionType.FOCUS) {
                String taskTitle = session.getTask() != null ? session.getTask().getTitle() : "Focus session";
                notificationService.createNotification(
                        user.getId(),
                        "Focus Session Completed",
                        "Great job! You completed " + session.getDurationMinutes() + " mins of focus on '" + taskTitle + "'.",
                        com.consistency.backend.model.NotificationType.FOCUS_COMPLETE
                );
            } else {
                notificationService.createNotification(
                        user.getId(),
                        "Break Completed",
                        "Break's over! Time to get back in the zone.",
                        com.consistency.backend.model.NotificationType.BREAK_COMPLETE
                );
            }
        } catch (Exception e) {
            // Log & do not block session completion
        }

        return mapToDTO(saved);
    }

    public FocusSessionDTO skipSession(Long id) {
        User user = currentUserService.getCurrentUser();
        FocusSession session = focusSessionRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Focus session not found"));

        session.setStatus(SessionStatus.SKIPPED);
        session.setCompletedAt(LocalDateTime.now());

        FocusSession saved = focusSessionRepository.save(session);
        return mapToDTO(saved);
    }

    public List<FocusSessionDTO> getTodaySessions() {
        User user = currentUserService.getCurrentUser();
        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);

        List<FocusSession> sessions = focusSessionRepository.findByUserIdAndStartedAtBetweenOrderByStartedAtDesc(
                user.getId(), startOfDay, endOfDay
        );

        return sessions.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public FocusStatsDTO getTodayStats() {
        User user = currentUserService.getCurrentUser();
        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);

        List<FocusSession> completedFocusSessions = focusSessionRepository.findByUserIdAndSessionTypeAndStatusAndStartedAtBetween(
                user.getId(), SessionType.FOCUS, SessionStatus.COMPLETED, startOfDay, endOfDay
        );

        long count = completedFocusSessions.size();
        long totalMinutes = completedFocusSessions.stream().mapToLong(FocusSession::getDurationMinutes).sum();

        return new FocusStatsDTO(count, totalMinutes);
    }

    private FocusSessionDTO mapToDTO(FocusSession session) {
        Long taskId = session.getTask() != null ? session.getTask().getId() : null;
        String taskTitle = session.getTask() != null ? session.getTask().getTitle() : null;

        return new FocusSessionDTO(
                session.getId(),
                taskId,
                taskTitle,
                session.getSessionType(),
                session.getDurationMinutes(),
                session.getStartedAt(),
                session.getCompletedAt(),
                session.getStatus()
        );
    }
}
