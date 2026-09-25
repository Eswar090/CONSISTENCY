package com.consistency.backend.service;

import com.consistency.backend.dto.CreateReminderRequest;
import com.consistency.backend.dto.ReminderDTO;
import com.consistency.backend.model.Reminder;
import com.consistency.backend.repository.ReminderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ReminderService {

    private final ReminderRepository reminderRepository;

    @Autowired
    public ReminderService(ReminderRepository reminderRepository) {
        this.reminderRepository = reminderRepository;
    }

    public List<ReminderDTO> getUserReminders(Long userId) {
        return reminderRepository.findByUserId(userId)
                .stream()
                .map(ReminderDTO::new)
                .collect(Collectors.toList());
    }

    public Optional<ReminderDTO> getReminderForTask(Long taskId, Long userId) {
        return reminderRepository.findByTaskIdAndUserId(taskId, userId)
                .map(ReminderDTO::new);
    }

    public Optional<ReminderDTO> getReminderForHabit(Long habitId, Long userId) {
        return reminderRepository.findByHabitIdAndUserId(habitId, userId)
                .map(ReminderDTO::new);
    }

    @Transactional
    public ReminderDTO createOrUpdateReminder(Long userId, CreateReminderRequest req) {
        // Prevent duplicates when taskId or habitId is passed
        Optional<Reminder> existing = Optional.empty();
        if (req.getTaskId() != null) {
            existing = reminderRepository.findByTaskIdAndUserId(req.getTaskId(), userId);
        } else if (req.getHabitId() != null) {
            existing = reminderRepository.findByHabitIdAndUserId(req.getHabitId(), userId);
        }

        Reminder reminder;
        if (existing.isPresent()) {
            reminder = existing.get();
            reminder.setTitle(req.getTitle());
            reminder.setMessage(req.getMessage());
            reminder.setType(req.getType());
            reminder.setFrequency(req.getFrequency());
            reminder.setReminderDate(req.getReminderDate());
            reminder.setReminderTime(req.getReminderTime());
            reminder.setDayOfWeek(req.getDayOfWeek());
            reminder.setActive(req.getActive() != null ? req.getActive() : true);
        } else {
            reminder = new Reminder(
                    userId,
                    req.getTitle(),
                    req.getMessage(),
                    req.getType(),
                    req.getFrequency(),
                    req.getReminderDate(),
                    req.getReminderTime(),
                    req.getDayOfWeek(),
                    req.getTaskId(),
                    req.getHabitId(),
                    req.getActive()
            );
        }

        Reminder saved = reminderRepository.save(reminder);
        return new ReminderDTO(saved);
    }

    @Transactional
    public ReminderDTO updateReminder(Long reminderId, Long userId, CreateReminderRequest req) {
        Reminder reminder = reminderRepository.findByIdAndUserId(reminderId, userId)
                .orElseThrow(() -> new RuntimeException("Reminder not found or access denied: " + reminderId));

        reminder.setTitle(req.getTitle());
        reminder.setMessage(req.getMessage());
        reminder.setType(req.getType());
        reminder.setFrequency(req.getFrequency());
        reminder.setReminderDate(req.getReminderDate());
        reminder.setReminderTime(req.getReminderTime());
        reminder.setDayOfWeek(req.getDayOfWeek());
        reminder.setActive(req.getActive() != null ? req.getActive() : true);

        Reminder saved = reminderRepository.save(reminder);
        return new ReminderDTO(saved);
    }

    @Transactional
    public void deleteReminder(Long reminderId, Long userId) {
        Reminder reminder = reminderRepository.findByIdAndUserId(reminderId, userId)
                .orElseThrow(() -> new RuntimeException("Reminder not found or access denied: " + reminderId));
        reminderRepository.delete(reminder);
    }
}
