package com.consistency.backend.controller;

import com.consistency.backend.dto.CreateGoalRequest;
import com.consistency.backend.dto.GoalDTO;
import com.consistency.backend.dto.UpdateGoalRequest;
import com.consistency.backend.entity.GoalStatus;
import com.consistency.backend.service.GoalService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
public class GoalController {
    
    private final GoalService goalService;

    public GoalController(GoalService goalService) {
        this.goalService = goalService;
    }

    @GetMapping
    public ResponseEntity<List<GoalDTO>> getGoals() {
        return ResponseEntity.ok(goalService.getGoals());
    }

    @GetMapping("/{id}")
    public ResponseEntity<GoalDTO> getGoalById(@PathVariable Long id) {
        return ResponseEntity.ok(goalService.getGoalById(id));
    }

    @PostMapping
    public ResponseEntity<GoalDTO> createGoal(@RequestBody CreateGoalRequest request) {
        return ResponseEntity.ok(goalService.createGoal(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GoalDTO> updateGoal(@PathVariable Long id, @RequestBody UpdateGoalRequest request) {
        return ResponseEntity.ok(goalService.updateGoal(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<GoalDTO> updateGoalStatus(@PathVariable Long id, @RequestBody UpdateGoalRequest request) {
        return ResponseEntity.ok(goalService.updateGoal(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(@PathVariable Long id) {
        goalService.deleteGoal(id);
        return ResponseEntity.ok().build();
    }
}
