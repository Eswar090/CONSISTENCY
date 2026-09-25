package com.consistency.backend.service;

import com.consistency.backend.dto.DailyConsistencyDTO;
import com.consistency.backend.dto.SmartAlertHistoryDTO;
import com.consistency.backend.dto.SmartAlertSettingsDTO;
import com.consistency.backend.dto.UpdateSmartAlertSettingsRequest;
import com.consistency.backend.entity.SmartAlertHistory;
import com.consistency.backend.entity.SmartAlertSettings;
import com.consistency.backend.entity.User;
import com.consistency.backend.repository.SmartAlertHistoryRepository;
import com.consistency.backend.repository.SmartAlertSettingsRepository;
import com.consistency.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SmartAlertService {

    private static final Logger logger = LoggerFactory.getLogger(SmartAlertService.class);
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final SmartAlertSettingsRepository settingsRepo;
    private final SmartAlertHistoryRepository historyRepo;
    private final UserRepository userRepository;
    private final ConsistencyService consistencyService;
    private final SMSProviderService smsProviderService;
    private final PasswordEncoder passwordEncoder;
    private final CurrentUserService currentUserService;

    public SmartAlertService(SmartAlertSettingsRepository settingsRepo,
                             SmartAlertHistoryRepository historyRepo,
                             UserRepository userRepository,
                             ConsistencyService consistencyService,
                             SMSProviderService smsProviderService,
                             PasswordEncoder passwordEncoder,
                             CurrentUserService currentUserService) {
        this.settingsRepo = settingsRepo;
        this.historyRepo = historyRepo;
        this.userRepository = userRepository;
        this.consistencyService = consistencyService;
        this.smsProviderService = smsProviderService;
        this.passwordEncoder = passwordEncoder;
        this.currentUserService = currentUserService;
    }

    // ─── Settings ────────────────────────────────────────────────

    public SmartAlertSettingsDTO getSettings() {
        User user = currentUserService.getCurrentUser();
        SmartAlertSettings settings = getOrCreateSettings(user.getId());
        return toDTO(user, settings);
    }

    @Transactional
    public SmartAlertSettingsDTO updateSettings(UpdateSmartAlertSettingsRequest req) {
        User user = currentUserService.getCurrentUser();
        SmartAlertSettings settings = getOrCreateSettings(user.getId());

        if (req.getEnabled() != null) {
            // Can only enable if phone is verified
            if (Boolean.TRUE.equals(req.getEnabled()) && !Boolean.TRUE.equals(user.getMobileVerified())) {
                throw new IllegalArgumentException("Please verify your mobile number before enabling SMS alerts.");
            }
            settings.setEnabled(req.getEnabled());
        }
        if (req.getProgressThreshold() != null) {
            double t = req.getProgressThreshold();
            if (t < 1 || t > 100) throw new IllegalArgumentException("Progress threshold must be between 1 and 100.");
            settings.setProgressThreshold(t);
        }
        if (req.getStartTime() != null) {
            settings.setStartTime(LocalTime.parse(req.getStartTime(), TIME_FMT));
        }
        if (req.getEndTime() != null) {
            settings.setEndTime(LocalTime.parse(req.getEndTime(), TIME_FMT));
        }
        if (req.getRepeatIntervalMinutes() != null) {
            int interval = req.getRepeatIntervalMinutes();
            if (interval != 30 && interval != 60 && interval != 120) {
                throw new IllegalArgumentException("Repeat interval must be 30, 60, or 120 minutes.");
            }
            settings.setRepeatIntervalMinutes(interval);
        }
        if (req.getMaxAlertsPerDay() != null) {
            int max = req.getMaxAlertsPerDay();
            if (max < 1 || max > 5) throw new IllegalArgumentException("Maximum alerts per day must be between 1 and 5.");
            settings.setMaxAlertsPerDay(max);
        }

        settingsRepo.save(settings);
        return toDTO(user, settings);
    }

    // ─── Phone Verification ───────────────────────────────────────

    @Transactional
    public String requestVerification(String mobileNumber) {
        User user = currentUserService.getCurrentUser();

        // Validate format: starts with +, 10-15 digits total
        if (mobileNumber == null || !mobileNumber.matches("^\\+[1-9]\\d{9,14}$")) {
            throw new IllegalArgumentException("Invalid mobile number. Use E.164 format e.g. +919876543210");
        }

        // Check if another verified user already has this number
        if (userRepository.existsByMobileNumberAndMobileVerified(mobileNumber, true)) {
            User existingOwner = userRepository.findByMobileNumber(mobileNumber).orElse(null);
            if (existingOwner != null && !existingOwner.getId().equals(user.getId())) {
                throw new IllegalArgumentException("This mobile number is already in use by another account.");
            }
        }

        // Rate limit: max 3 OTP requests per hour
        if (user.getLastOtpRequestAt() != null) {
            long minutesSinceLast = java.time.Duration.between(user.getLastOtpRequestAt(), LocalDateTime.now()).toMinutes();
            int attempts = user.getOtpAttemptCount() == null ? 0 : user.getOtpAttemptCount();
            if (minutesSinceLast < 60 && attempts >= 3) {
                throw new IllegalArgumentException("Too many OTP requests. Please wait before requesting again.");
            }
            if (minutesSinceLast >= 60) {
                user.setOtpAttemptCount(0); // reset hourly
            }
        }

        // Generate 6-digit OTP
        int otp = 100000 + SECURE_RANDOM.nextInt(900000);
        String otpStr = String.valueOf(otp);

        // Store pending mobile in mobile_number (mobile_verified=false means it's not yet active).
        // The old verified number is replaced here, but verification is required before any feature
        // treats this as a verified number.
        user.setMobileNumber(mobileNumber);
        user.setMobileVerified(false);
        user.setMobileOtpHash(passwordEncoder.encode(otpStr));
        user.setMobileOtpExpiresAt(LocalDateTime.now().plusMinutes(10));
        user.setOtpAttemptCount((user.getOtpAttemptCount() == null ? 0 : user.getOtpAttemptCount()) + 1);
        user.setLastOtpRequestAt(LocalDateTime.now());
        userRepository.save(user);

        // Try to send OTP via SMS
        String smsMessage = "CONSISTENCY: Your verification code is " + otpStr + ". Valid for 10 minutes.";
        boolean sent = smsProviderService.sendSms(mobileNumber, smsMessage);

        if (!sent || !smsProviderService.isConfigured()) {
            logger.warn("SMS not configured — simulated sending for development testing.");
            return "Verification code sent to your mobile number (Simulated).";
        }
        return "Verification code sent to your mobile number.";
    }

    @Transactional
    public String verifyPhone(String otp) {
        User user = currentUserService.getCurrentUser();

        if (user.getMobileOtpHash() == null) {
            throw new IllegalArgumentException("No verification was requested. Please request a verification code first.");
        }
        if (user.getMobileOtpExpiresAt() == null || LocalDateTime.now().isAfter(user.getMobileOtpExpiresAt())) {
            user.setMobileOtpHash(null);
            user.setMobileOtpExpiresAt(null);
            userRepository.save(user);
            throw new IllegalArgumentException("Verification code has expired. Please request a new one.");
        }
        if (otp == null || otp.isBlank()) {
            throw new IllegalArgumentException("OTP cannot be empty.");
        }

        if (!passwordEncoder.matches(otp.trim(), user.getMobileOtpHash())) {
            throw new IllegalArgumentException("Invalid verification code. Please try again.");
        }

        // Success — mobile_number is already set to the new number; just mark verified
        user.setMobileVerified(true);
        user.setMobileOtpHash(null);
        user.setMobileOtpExpiresAt(null);
        user.setOtpAttemptCount(0);
        userRepository.save(user);
        return "Mobile number verified successfully.";
    }

    // ─── History ──────────────────────────────────────────────────

    public List<SmartAlertHistoryDTO> getHistory() {
        User user = currentUserService.getCurrentUser();
        return historyRepo.findByUserIdOrderBySentAtDesc(user.getId())
                .stream().limit(30)
                .map(SmartAlertHistoryDTO::new)
                .collect(Collectors.toList());
    }

    // ─── Test SMS ─────────────────────────────────────────────────

    @Transactional
    public String sendTestSms() {
        User user = currentUserService.getCurrentUser();
        System.out.println("[SMART SMS DEBUG] Authenticated user: " + user.getId());
        System.out.println("[SMART SMS DEBUG] Mobile: " + user.getMobileNumber());
        System.out.println("[SMART SMS DEBUG] Mobile verified: " + user.getMobileVerified());

        if (!Boolean.TRUE.equals(user.getMobileVerified()) || user.getMobileNumber() == null) {
            throw new IllegalArgumentException("Please verify your mobile number before sending a test SMS.");
        }

        String message = "CONSISTENCY test alert: SMS notifications are working correctly.";
        System.out.println("[SMART SMS DEBUG] Provider Configured: " + smsProviderService.isConfigured());
        System.out.println("[SMART SMS DEBUG] Mock SMS sending: " + !smsProviderService.isConfigured());
        boolean sent = smsProviderService.sendSms(user.getMobileNumber(), message);

        if (!smsProviderService.isConfigured()) {
            return "Test SMS logged to console (Mock mode).";
        }

        return sent ? "Test SMS sent successfully." : "Test SMS failed. Please check your SMS provider configuration.";
    }

    /**
     * DEV-ONLY: Trigger the scheduler eligibility check for the currently authenticated user
     * right now, using real IST time and real consistency data.
     * Does NOT bypass any eligibility rule — identical logic to the production scheduler.
     * Returns a human-readable diagnostic result.
     */
    @Transactional
    public Map<String, Object> runDevSchedulerCheck() {
        User user = currentUserService.getCurrentUser();
        java.time.ZoneId IST = java.time.ZoneId.of("Asia/Kolkata");
        LocalDate today = LocalDate.now(IST);
        LocalTime now = LocalTime.now(IST);

        Map<String, Object> result = new java.util.LinkedHashMap<>();
        result.put("devTest", true);
        result.put("userId", user.getId());
        result.put("istDate", today.toString());
        result.put("istTime", now.format(TIME_FMT));

        SmartAlertSettings settings = getOrCreateSettings(user.getId());
        result.put("alertsEnabled", settings.getEnabled());
        result.put("mobileVerified", user.getMobileVerified());
        result.put("windowStart", settings.getStartTime().format(TIME_FMT));
        result.put("windowEnd", settings.getEndTime().format(TIME_FMT));
        result.put("threshold", settings.getProgressThreshold());

        // Check: enabled
        if (!Boolean.TRUE.equals(settings.getEnabled())) {
            result.put("skipped", "Alerts are disabled for this user.");
            return result;
        }
        // Check: verified
        if (!Boolean.TRUE.equals(user.getMobileVerified()) || user.getMobileNumber() == null) {
            result.put("skipped", "Mobile number not verified.");
            return result;
        }
        // Check: time window
        if (now.isBefore(settings.getStartTime()) || now.isAfter(settings.getEndTime())) {
            result.put("skipped", "Current IST time " + now.format(TIME_FMT) + " is outside alert window "
                    + settings.getStartTime().format(TIME_FMT) + "–" + settings.getEndTime().format(TIME_FMT) + ".");
            return result;
        }

        // Check: consistency
        DailyConsistencyDTO daily = consistencyService.calculateDailyConsistencyForUser(user.getId(), today);
        Double progress = daily.getDailyConsistency();
        result.put("consistencyPercent", progress);

        if (progress == null) {
            result.put("skipped", "No productivity data for today — no tasks or habits planned.");
            return result;
        }
        if (progress >= settings.getProgressThreshold()) {
            result.put("skipped", "Progress " + Math.round(progress) + "% >= threshold " + settings.getProgressThreshold() + "% — no alert needed.");
            return result;
        }

        int remainingTasks = 0, remainingHabits = 0;
        if (daily.getPlannedTasks() != null && daily.getCompletedTasks() != null)
            remainingTasks = daily.getPlannedTasks() - daily.getCompletedTasks();
        if (daily.getScheduledHabits() != null && daily.getCompletedHabits() != null)
            remainingHabits = daily.getScheduledHabits() - daily.getCompletedHabits();
        result.put("remainingTasks", remainingTasks);
        result.put("remainingHabits", remainingHabits);

        if (remainingTasks <= 0 && remainingHabits <= 0) {
            result.put("skipped", "No meaningful work remains — no alert needed.");
            return result;
        }

        long alertsToday = historyRepo.countByUserIdAndAlertDateAndMessageType(user.getId(), today, "ALERT");
        result.put("alertsSentToday", alertsToday);
        if (alertsToday >= settings.getMaxAlertsPerDay()) {
            result.put("skipped", "Daily alert limit (" + settings.getMaxAlertsPerDay() + ") reached.");
            return result;
        }

        Optional<SmartAlertHistory> lastAlert = historyRepo.findTopByUserIdAndAlertDateOrderBySentAtDesc(user.getId(), today);
        if (lastAlert.isPresent()) {
            long minsSince = java.time.Duration.between(lastAlert.get().getSentAt(), LocalDateTime.now()).toMinutes();
            result.put("minutesSinceLastAlert", minsSince);
            if (minsSince < settings.getRepeatIntervalMinutes()) {
                result.put("skipped", "Last alert was " + minsSince + " minutes ago — repeat interval is "
                        + settings.getRepeatIntervalMinutes() + " minutes.");
                return result;
            }
        }

        // All checks passed — send alert
        String message = buildSmsMessage(progress, remainingTasks, remainingHabits);
        logger.info("[DEV SCHEDULER TRIGGER] Sending alert for userId={}", user.getId());
        boolean sent = smsProviderService.sendSms(user.getMobileNumber(), message);

        SmartAlertHistory record = new SmartAlertHistory();
        record.setUserId(user.getId());
        record.setAlertDate(today);
        record.setSentAt(LocalDateTime.now());
        record.setProgressPercentage(progress);
        record.setRemainingTasks(remainingTasks);
        record.setRemainingHabits(remainingHabits);
        record.setMessageType("ALERT");
        record.setSlotTime(now);
        historyRepo.save(record);

        result.put("alertSent", true);
        result.put("mockMode", !smsProviderService.isConfigured());
        result.put("message", message);
        return result;
    }

    // ─── Scheduler evaluation (called by SmartAlertScheduler) ────

    @Transactional
    public void evaluateUserAlert(Long userId, SmartAlertSettings settings, LocalDate today, LocalTime now) {
        // 1. Check alert window
        if (now.isBefore(settings.getStartTime()) || now.isAfter(settings.getEndTime())) {
            return;
        }

        // 2. Fetch user and verify phone
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) return;
        User user = userOpt.get();
        if (!Boolean.TRUE.equals(user.getMobileVerified()) || user.getMobileNumber() == null) return;

        // 3. Calculate today's progress using user-scoped method (no auth context needed)
        DailyConsistencyDTO daily = consistencyService.calculateDailyConsistencyForUser(userId, today);

        // 4. If no data at all, no alert
        if (daily.getDailyConsistency() == null) return;

        double progress = daily.getDailyConsistency();

        // 5. If progress >= threshold, no alert needed
        if (progress >= settings.getProgressThreshold()) return;

        // 6. Check remaining meaningful work
        int remainingTasks = 0;
        int remainingHabits = 0;
        if (daily.getPlannedTasks() != null && daily.getCompletedTasks() != null) {
            remainingTasks = daily.getPlannedTasks() - daily.getCompletedTasks();
        }
        if (daily.getScheduledHabits() != null && daily.getCompletedHabits() != null) {
            remainingHabits = daily.getScheduledHabits() - daily.getCompletedHabits();
        }
        if (remainingTasks <= 0 && remainingHabits <= 0) return;

        // 7. Check daily alert limit (ALERT type only, not TEST)
        long alertsSentToday = historyRepo.countByUserIdAndAlertDateAndMessageType(userId, today, "ALERT");
        if (alertsSentToday >= settings.getMaxAlertsPerDay()) return;

        // 8. Check repeat interval — last alert must be at least repeatIntervalMinutes ago
        Optional<SmartAlertHistory> lastAlert = historyRepo.findTopByUserIdAndAlertDateOrderBySentAtDesc(userId, today);
        if (lastAlert.isPresent()) {
            long minutesSinceLast = java.time.Duration.between(lastAlert.get().getSentAt(), LocalDateTime.now()).toMinutes();
            if (minutesSinceLast < settings.getRepeatIntervalMinutes()) return;
        }

        // 9. Build and send SMS
        String message = buildSmsMessage(progress, remainingTasks, remainingHabits);
        boolean sent = smsProviderService.sendSms(user.getMobileNumber(), message);

        // 10. Record in history (even for mock provider, so duplicate logic works)
        SmartAlertHistory record = new SmartAlertHistory();
        record.setUserId(userId);
        record.setAlertDate(today);
        record.setSentAt(LocalDateTime.now());
        record.setProgressPercentage(progress);
        record.setRemainingTasks(remainingTasks);
        record.setRemainingHabits(remainingHabits);
        record.setMessageType("ALERT");
        record.setSlotTime(now);
        historyRepo.save(record);

        if (sent) {
            logger.info("Smart alert sent for user {} — progress: {}%", userId, Math.round(progress));
        } else {
            logger.warn("Smart alert failed to send for user {}", userId);
        }
    }

    // ─── Helpers ──────────────────────────────────────────────────

    public SmartAlertSettings getOrCreateSettings(Long userId) {
        return settingsRepo.findByUserId(userId).orElseGet(() -> {
            SmartAlertSettings s = new SmartAlertSettings();
            s.setUserId(userId);
            return settingsRepo.save(s);
        });
    }

    private SmartAlertSettingsDTO toDTO(User user, SmartAlertSettings settings) {
        SmartAlertSettingsDTO dto = new SmartAlertSettingsDTO();
        dto.setEnabled(settings.getEnabled());
        dto.setMobileVerified(Boolean.TRUE.equals(user.getMobileVerified()));
        dto.setMobileNumberMasked(maskNumber(user.getMobileNumber()));
        dto.setProgressThreshold(settings.getProgressThreshold());
        dto.setStartTime(settings.getStartTime().format(TIME_FMT));
        dto.setEndTime(settings.getEndTime().format(TIME_FMT));
        dto.setRepeatIntervalMinutes(settings.getRepeatIntervalMinutes());
        dto.setMaxAlertsPerDay(settings.getMaxAlertsPerDay());
        dto.setSmsConfigured(smsProviderService.isConfigured());
        return dto;
    }

    private String maskNumber(String number) {
        if (number == null || number.length() < 4) return null;
        return number.substring(0, number.length() - 4).replaceAll("\\d", "*")
               + number.substring(number.length() - 4);
    }

    private String buildSmsMessage(double progress, int remainingTasks, int remainingHabits) {
        StringBuilder sb = new StringBuilder("CONSISTENCY ALERT: Your progress today is ");
        sb.append(Math.round(progress)).append("%. ");
        if (remainingTasks > 0 && remainingHabits > 0) {
            sb.append("You have ").append(remainingTasks).append(" task(s) and ")
              .append(remainingHabits).append(" habit(s) remaining. ");
        } else if (remainingTasks > 0) {
            sb.append("You have ").append(remainingTasks).append(" planned task(s) remaining. ");
        } else if (remainingHabits > 0) {
            sb.append("You have ").append(remainingHabits).append(" scheduled habit(s) remaining. ");
        }
        sb.append("Consider completing your highest-priority item before the day ends.");
        return sb.toString();
    }
}
