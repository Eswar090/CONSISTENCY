package com.consistency.backend.service;

import com.consistency.backend.entity.SmartAlertSettings;
import com.consistency.backend.repository.SmartAlertSettingsRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import java.time.ZoneId;

/**
 * Scheduled service that evaluates smart accountability alerts every 30 minutes.
 * Each user is processed independently — one failure does not stop others.
 */
@Service
public class SmartAlertScheduler {

    private static final Logger logger = LoggerFactory.getLogger(SmartAlertScheduler.class);
    private static final ZoneId IST_ZONE = ZoneId.of("Asia/Kolkata");

    private final SmartAlertSettingsRepository settingsRepository;
    private final SmartAlertService smartAlertService;

    public SmartAlertScheduler(SmartAlertSettingsRepository settingsRepository,
                               SmartAlertService smartAlertService) {
        this.settingsRepository = settingsRepository;
        this.smartAlertService = smartAlertService;
    }

    @Scheduled(fixedRate = 1800000) // Every 30 minutes
    public void evaluateAllAlerts() {
        LocalDate today = LocalDate.now(IST_ZONE);
        LocalTime now = LocalTime.now(IST_ZONE);

        List<SmartAlertSettings> enabledSettings = settingsRepository.findByEnabledTrue();

        if (enabledSettings.isEmpty()) {
            return; // Nothing to evaluate
        }

        logger.debug("Smart alert evaluation started for {} user(s) at {}", enabledSettings.size(), now);

        for (SmartAlertSettings settings : enabledSettings) {
            try {
                smartAlertService.evaluateUserAlert(settings.getUserId(), settings, today, now);
            } catch (Exception e) {
                // One user's failure must NOT stop the rest
                logger.error("Smart alert evaluation failed for userId={}: {}", settings.getUserId(), e.getMessage());
            }
        }

        logger.debug("Smart alert evaluation completed.");
    }
}
