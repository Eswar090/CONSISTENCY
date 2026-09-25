package com.consistency.backend.service;

import com.consistency.backend.dto.AggregateConsistencyDTO;
import com.consistency.backend.dto.AnalyticsResponseDTO;
import com.consistency.backend.dto.HabitStatsDTO;
import com.consistency.backend.entity.Habit;
import com.consistency.backend.entity.User;
import com.consistency.backend.repository.HabitRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.time.temporal.WeekFields;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class AnalyticsService {

    private final ConsistencyService consistencyService;
    private final HabitRepository habitRepository;
    private final CurrentUserService currentUserService;
    private final FocusSessionService focusSessionService;

    public AnalyticsService(ConsistencyService consistencyService, HabitRepository habitRepository, CurrentUserService currentUserService, FocusSessionService focusSessionService) {
        this.consistencyService = consistencyService;
        this.habitRepository = habitRepository;
        this.currentUserService = currentUserService;
        this.focusSessionService = focusSessionService;
    }

    public AnalyticsResponseDTO getAnalytics(LocalDate startDate, LocalDate endDate) {
        AnalyticsResponseDTO response = new AnalyticsResponseDTO();
        response.setStartDate(startDate);
        response.setEndDate(endDate);

        User user = currentUserService.getCurrentUser();

        // Fetch overall aggregate and daily data
        AggregateConsistencyDTO aggregate = consistencyService.calculateAggregateConsistency(startDate, endDate);
        
        response.setOverallConsistency(aggregate.getOverallConsistencyPercentage());
        response.setPlannedTasks(aggregate.getTotalPlannedTasks());
        response.setCompletedTasks(aggregate.getTotalCompletedTasks());
        response.setTaskExecutionPercentage(aggregate.getTaskExecutionPercentage());
        response.setScheduledHabits(aggregate.getTotalScheduledHabits());
        response.setCompletedHabits(aggregate.getTotalCompletedHabits());
        response.setHabitConsistencyPercentage(aggregate.getHabitConsistencyPercentage());
        response.setDailyData(aggregate.getDailyData());

        // Previous Period Comparison
        long daysDiff = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        LocalDate prevStartDate = startDate.minusDays(daysDiff);
        LocalDate prevEndDate = endDate.minusDays(daysDiff);
        
        AggregateConsistencyDTO prevAggregate = consistencyService.calculateAggregateConsistency(prevStartDate, prevEndDate);
        response.setPreviousOverallConsistency(prevAggregate.getOverallConsistencyPercentage());

        // Habit Performance for current user
        List<Habit> userHabits = habitRepository.findByUserId(user.getId());
        List<HabitStatsDTO> habitPerformance = new ArrayList<>();
        for (Habit h : userHabits) {
            // Only include active habits, or habits that were active during the period
            if (h.getArchivedAt() != null && h.getArchivedAt().isBefore(startDate)) {
                continue; // Archived before this period started
            }
            if (h.getStartDate().isAfter(endDate)) {
                continue; // Started after this period ended
            }
            HabitStatsDTO stats = consistencyService.calculateHabitStats(h.getId());
            // Map the name and icon to the DTO for frontend convenience
            stats.setName(h.getName());
            stats.setIcon(h.getIcon());
            habitPerformance.add(stats);
        }
        response.setHabitPerformance(habitPerformance);

        // Compute Weekly Breakdown from Daily Data to reuse logic perfectly
        List<AggregateConsistencyDTO> weeklyData = new ArrayList<>();
        LocalDate currentWeekStart = null;
        LocalDate currentWeekEnd = null;
        WeekFields weekFields = WeekFields.of(Locale.getDefault());
        
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            // Just reuse ConsistencyService calculation per week
            if (date.getDayOfWeek() == weekFields.getFirstDayOfWeek() || currentWeekStart == null) {
                if (currentWeekStart != null) {
                    AggregateConsistencyDTO weekAgg = consistencyService.calculateAggregateConsistency(currentWeekStart, currentWeekEnd);
                    weekAgg.setDailyData(null); // Don't send per-day data in weekly breakdown
                    weeklyData.add(weekAgg);
                }
                currentWeekStart = date;
            }
            currentWeekEnd = date;
        }
        if (currentWeekStart != null) {
            AggregateConsistencyDTO weekAgg = consistencyService.calculateAggregateConsistency(currentWeekStart, currentWeekEnd);
            weekAgg.setDailyData(null);
            weeklyData.add(weekAgg);
        }
        response.setWeeklyData(weeklyData);

        // Compute Monthly Breakdown
        List<AggregateConsistencyDTO> monthlyData = new ArrayList<>();
        YearMonth currentMonth = null;
        LocalDate currentMonthStart = null;
        LocalDate currentMonthEnd = null;

        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            YearMonth ym = YearMonth.from(date);
            if (!ym.equals(currentMonth)) {
                if (currentMonth != null) {
                    AggregateConsistencyDTO monthAgg = consistencyService.calculateAggregateConsistency(currentMonthStart, currentMonthEnd);
                    monthAgg.setDailyData(null);
                    monthlyData.add(monthAgg);
                }
                currentMonth = ym;
                currentMonthStart = date;
            }
            currentMonthEnd = date;
        }
        if (currentMonth != null) {
            AggregateConsistencyDTO monthAgg = consistencyService.calculateAggregateConsistency(currentMonthStart, currentMonthEnd);
            monthAgg.setDailyData(null);
            monthlyData.add(monthAgg);
        }
        response.setMonthlyData(monthlyData);
        response.setFocusStats(focusSessionService.getTodayStats());

        return response;
    }
}
