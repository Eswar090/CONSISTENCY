package com.consistency.backend.service;

import com.consistency.backend.dto.FocusSettingsDTO;
import com.consistency.backend.entity.FocusSettings;
import com.consistency.backend.entity.User;
import com.consistency.backend.repository.FocusSettingsRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class FocusSettingsService {

    private final FocusSettingsRepository focusSettingsRepository;
    private final CurrentUserService currentUserService;

    public FocusSettingsService(FocusSettingsRepository focusSettingsRepository, CurrentUserService currentUserService) {
        this.focusSettingsRepository = focusSettingsRepository;
        this.currentUserService = currentUserService;
    }

    public FocusSettingsDTO getSettings() {
        User user = currentUserService.getCurrentUser();
        Optional<FocusSettings> settingsOpt = focusSettingsRepository.findByUserId(user.getId());

        if (settingsOpt.isPresent()) {
            return mapToDTO(settingsOpt.get());
        }

        // Return default settings DTO if none present
        return new FocusSettingsDTO(25, 5, 15, 4);
    }

    public FocusSettingsDTO updateSettings(FocusSettingsDTO dto) {
        User user = currentUserService.getCurrentUser();

        // Validation
        if (dto.getFocusMinutes() == null || dto.getFocusMinutes() < 1 || dto.getFocusMinutes() > 180) {
            throw new IllegalArgumentException("Focus duration must be between 1 and 180 minutes.");
        }
        if (dto.getShortBreakMinutes() == null || dto.getShortBreakMinutes() < 1 || dto.getShortBreakMinutes() > 60) {
            throw new IllegalArgumentException("Short break must be between 1 and 60 minutes.");
        }
        if (dto.getLongBreakMinutes() == null || dto.getLongBreakMinutes() < 1 || dto.getLongBreakMinutes() > 120) {
            throw new IllegalArgumentException("Long break must be between 1 and 120 minutes.");
        }
        if (dto.getSessionsBeforeLongBreak() == null || dto.getSessionsBeforeLongBreak() < 1 || dto.getSessionsBeforeLongBreak() > 10) {
            throw new IllegalArgumentException("Sessions before long break must be between 1 and 10.");
        }

        Optional<FocusSettings> settingsOpt = focusSettingsRepository.findByUserId(user.getId());
        FocusSettings settings;
        if (settingsOpt.isPresent()) {
            settings = settingsOpt.get();
        } else {
            settings = new FocusSettings();
            settings.setUser(user);
        }

        settings.setFocusMinutes(dto.getFocusMinutes());
        settings.setShortBreakMinutes(dto.getShortBreakMinutes());
        settings.setLongBreakMinutes(dto.getLongBreakMinutes());
        settings.setSessionsBeforeLongBreak(dto.getSessionsBeforeLongBreak());

        FocusSettings saved = focusSettingsRepository.save(settings);
        return mapToDTO(saved);
    }

    private FocusSettingsDTO mapToDTO(FocusSettings settings) {
        return new FocusSettingsDTO(
                settings.getFocusMinutes(),
                settings.getShortBreakMinutes(),
                settings.getLongBreakMinutes(),
                settings.getSessionsBeforeLongBreak()
        );
    }
}
