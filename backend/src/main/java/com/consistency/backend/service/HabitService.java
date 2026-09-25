package com.consistency.backend.service;

import com.consistency.backend.entity.Habit;
import com.consistency.backend.entity.HabitLog;
import com.consistency.backend.entity.User;
import com.consistency.backend.exception.ResourceNotFoundException;
import com.consistency.backend.repository.HabitLogRepository;
import com.consistency.backend.repository.HabitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class HabitService {

    private final HabitRepository habitRepository;
    private final HabitLogRepository habitLogRepository;
    private final CurrentUserService currentUserService;

    public HabitService(HabitRepository habitRepository, HabitLogRepository habitLogRepository, CurrentUserService currentUserService) {
        this.habitRepository = habitRepository;
        this.habitLogRepository = habitLogRepository;
        this.currentUserService = currentUserService;
    }

    public List<Habit> getActiveHabits() {
        User user = currentUserService.getCurrentUser();
        return habitRepository.findByUserIdAndActiveTrueOrderByIdAsc(user.getId());
    }

    public Habit createHabit(Habit habit) {
        User user = currentUserService.getCurrentUser();
        habit.setUser(user);
        return habitRepository.save(habit);
    }

    public Habit updateHabit(Long id, Habit habitDetails) {
        User user = currentUserService.getCurrentUser();
        Habit habit = habitRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Habit not found with id " + id));

        habit.setName(habitDetails.getName());
        habit.setIcon(habitDetails.getIcon());
        habit.setFrequencyType(habitDetails.getFrequencyType());
        habit.setSelectedDays(habitDetails.getSelectedDays());
        
        return habitRepository.save(habit);
    }

    public void archiveHabit(Long id) {
        User user = currentUserService.getCurrentUser();
        Habit habit = habitRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Habit not found with id " + id));
        habit.setActive(false);
        habit.setArchivedAt(LocalDate.now());
        habitRepository.save(habit);
    }

    // Log operations

    public List<HabitLog> getHabitLogsByDateRange(LocalDate startDate, LocalDate endDate) {
        User user = currentUserService.getCurrentUser();
        return habitLogRepository.findByHabitUserIdAndDateBetween(user.getId(), startDate, endDate);
    }

    @Transactional
    public HabitLog toggleHabitLog(Long habitId, LocalDate date, boolean completed) {
        User user = currentUserService.getCurrentUser();
        Habit habit = habitRepository.findByIdAndUserId(habitId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Habit not found with id " + habitId));

        Optional<HabitLog> existingLogOpt = habitLogRepository.findByHabitIdAndHabitUserIdAndDate(habitId, user.getId(), date);
        
        HabitLog log;
        if (existingLogOpt.isPresent()) {
            log = existingLogOpt.get();
        } else {
            log = new HabitLog();
            log.setHabit(habit);
            log.setDate(date);
        }
        
        log.setCompleted(completed);
        return habitLogRepository.save(log);
    }
}
