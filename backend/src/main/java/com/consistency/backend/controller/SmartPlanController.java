package com.consistency.backend.controller;

import com.consistency.backend.dto.SmartPlanDTO;
import com.consistency.backend.service.SmartPlanService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/smart-plan")
public class SmartPlanController {

    private final SmartPlanService smartPlanService;

    public SmartPlanController(SmartPlanService smartPlanService) {
        this.smartPlanService = smartPlanService;
    }

    @GetMapping
    public ResponseEntity<SmartPlanDTO> getSmartPlan(
            @RequestParam(name = "date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        if (date == null) {
            date = LocalDate.now();
        }
        return ResponseEntity.ok(smartPlanService.generateSmartPlan(date));
    }
}
