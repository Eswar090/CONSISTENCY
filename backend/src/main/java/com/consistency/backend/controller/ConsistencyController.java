package com.consistency.backend.controller;

import com.consistency.backend.dto.AggregateConsistencyDTO;
import com.consistency.backend.dto.DailyConsistencyDTO;
import com.consistency.backend.dto.HabitStatsDTO;
import com.consistency.backend.service.ConsistencyService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/consistency")
public class ConsistencyController {

    private final ConsistencyService consistencyService;

    public ConsistencyController(ConsistencyService consistencyService) {
        this.consistencyService = consistencyService;
    }

    @GetMapping("/daily")
    public ResponseEntity<DailyConsistencyDTO> getDailyConsistency(
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(consistencyService.calculateDailyConsistency(date));
    }

    @GetMapping("/weekly")
    public ResponseEntity<AggregateConsistencyDTO> getWeeklyConsistency(
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate) {
        // Assume standard 7-day week
        LocalDate endDate = startDate.plusDays(6);
        return ResponseEntity.ok(consistencyService.calculateAggregateConsistency(startDate, endDate));
    }

    @GetMapping("/monthly")
    public ResponseEntity<AggregateConsistencyDTO> getMonthlyConsistency(
            @RequestParam("year") int year,
            @RequestParam("month") int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        return ResponseEntity.ok(consistencyService.calculateAggregateConsistency(startDate, endDate));
    }

    @GetMapping("/habits/{id}")
    public ResponseEntity<HabitStatsDTO> getHabitStats(@PathVariable Long id) {
        return ResponseEntity.ok(consistencyService.calculateHabitStats(id));
    }
}
