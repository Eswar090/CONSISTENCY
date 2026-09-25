package com.consistency.backend.controller;

import com.consistency.backend.dto.SmartAlertHistoryDTO;
import com.consistency.backend.dto.SmartAlertSettingsDTO;
import com.consistency.backend.dto.UpdateSmartAlertSettingsRequest;
import com.consistency.backend.service.SmartAlertService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/smart-alerts")
public class SmartAlertController {

    private final SmartAlertService smartAlertService;

    public SmartAlertController(SmartAlertService smartAlertService) {
        this.smartAlertService = smartAlertService;
    }

    @GetMapping("/settings")
    public ResponseEntity<SmartAlertSettingsDTO> getSettings() {
        return ResponseEntity.ok(smartAlertService.getSettings());
    }

    @PutMapping("/settings")
    public ResponseEntity<SmartAlertSettingsDTO> updateSettings(@RequestBody UpdateSmartAlertSettingsRequest req) {
        return ResponseEntity.ok(smartAlertService.updateSettings(req));
    }

    @PostMapping("/phone/request-verification")
    public ResponseEntity<Map<String, String>> requestVerification(@RequestBody Map<String, String> body) {
        String mobileNumber = body.get("mobileNumber");
        String result = smartAlertService.requestVerification(mobileNumber);
        return ResponseEntity.ok(Map.of("message", result));
    }

    @PostMapping("/phone/verify")
    public ResponseEntity<Map<String, String>> verifyPhone(@RequestBody Map<String, String> body) {
        String otp = body.get("otp");
        String result = smartAlertService.verifyPhone(otp);
        return ResponseEntity.ok(Map.of("message", result));
    }

    @PostMapping("/test")
    public ResponseEntity<Map<String, String>> sendTestSms() {
        String result = smartAlertService.sendTestSms();
        return ResponseEntity.ok(Map.of("message", result));
    }

    @GetMapping("/history")
    public ResponseEntity<List<SmartAlertHistoryDTO>> getHistory() {
        return ResponseEntity.ok(smartAlertService.getHistory());
    }

    @PostMapping("/dev/trigger")
    public ResponseEntity<Map<String, Object>> runDevSchedulerCheck() {
        return ResponseEntity.ok(smartAlertService.runDevSchedulerCheck());
    }
}
