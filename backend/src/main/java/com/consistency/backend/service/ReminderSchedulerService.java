package com.consistency.backend.service;

import com.consistency.backend.model.*;
import com.consistency.backend.repository.ReminderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class ReminderSchedulerService {

    private static final Logger logger = LoggerFactory.getLogger(ReminderSchedulerService.class);

    private final ReminderRepository reminderRepository;
    private final NotificationService notificationService;

    @Autowired
    public ReminderSchedulerService(ReminderRepository reminderRepository, NotificationService notificationService) {
        this.reminderRepository = reminderRepository;
        this.notificationService = notificationService;
    }

    @Scheduled(fixedRate = 60000) // Run every 60 seconds
    @Transactional
    public void evaluateReminders() {
        LocalDate today = LocalDate.now();
        LocalTime nowTime = LocalTime.now();
        int currentDayOfWeek = today.getDayOfWeek().getValue(); // 1 (Mon) .. 7 (Sun)

        List<Reminder> activeReminders = reminderRepository.findByActiveTrue();

        for (Reminder reminder : activeReminders) {
            try {
                // Duplicate prevention: if already triggered today, skip
                if (today.equals(reminder.getLastTriggeredDate())) {
                    continue;
                }

                // Check time threshold: reminderTime <= nowTime and reminderTime >= nowTime minus 5 minutes
                // Or simply reminderTime <= nowTime if it hasn't fired today
                LocalTime rTime = reminder.getReminderTime();
                if (nowTime.isBefore(rTime)) {
                    continue; // Not time yet today
                }

                boolean shouldTrigger = false;
                NotificationType notifType = NotificationType.SYSTEM;

                switch (reminder.getFrequency()) {
                    case ONCE:
                        if (reminder.getReminderDate() != null && reminder.getReminderDate().equals(today)) {
                            shouldTrigger = true;
                        }
                        break;

                    case DAILY:
                        shouldTrigger = true;
                        break;

                    case WEEKLY:
                        // Correction #2: WEEKLY reminders MUST match scheduled dayOfWeek
                        if (reminder.getDayOfWeek() != null && reminder.getDayOfWeek().equals(currentDayOfWeek)) {
                            shouldTrigger = true;
                        }
                        break;
                }

                if (shouldTrigger) {
                    if (reminder.getType() == ReminderType.TASK) {
                        notifType = NotificationType.TASK_REMINDER;
                    } else if (reminder.getType() == ReminderType.HABIT) {
                        notifType = NotificationType.HABIT_REMINDER;
                    } else if (reminder.getType() == ReminderType.PLAN_TOMORROW) {
                        notifType = NotificationType.PLANNING_REMINDER;
                    }

                    String msg = reminder.getMessage() != null && !reminder.getMessage().isBlank()
                            ? reminder.getMessage()
                            : "Reminder for " + reminder.getTitle();

                    notificationService.createNotification(
                            reminder.getUserId(),
                            reminder.getTitle(),
                            msg,
                            notifType
                    );

                    // Update last triggered date
                    reminder.setLastTriggeredDate(today);

                    // If ONCE frequency, deactivate reminder after triggering
                    if (reminder.getFrequency() == ReminderFrequency.ONCE) {
                        reminder.setActive(false);
                    }

                    reminderRepository.save(reminder);
                    logger.info("Triggered reminder id {} for user {}", reminder.getId(), reminder.getUserId());
                }

            } catch (Exception e) {
                logger.error("Error evaluating reminder id {}: {}", reminder.getId(), e.getMessage(), e);
            }
        }
    }
}
