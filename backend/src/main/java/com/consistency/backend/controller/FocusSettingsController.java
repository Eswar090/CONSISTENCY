package com.consistency.backend.controller;

import com.consistency.backend.dto.FocusSettingsDTO;
import com.consistency.backend.service.FocusSettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/focus/settings")
public class FocusSettingsController {

    private final FocusSettingsService focusSettingsService;

    public FocusSettingsController(FocusSettingsService focusSettingsService) {
        this.focusSettingsService = focusSettingsService;
    }

    @GetMapping
    public ResponseEntity<FocusSettingsDTO> getSettings() {
        return ResponseEntity.ok(focusSettingsService.getSettings());
    }

    @PutMapping
    public ResponseEntity<FocusSettingsDTO> updateSettings(@RequestBody FocusSettingsDTO settingsDTO) {
        return ResponseEntity.ok(focusSettingsService.updateSettings(settingsDTO));
    }
}
