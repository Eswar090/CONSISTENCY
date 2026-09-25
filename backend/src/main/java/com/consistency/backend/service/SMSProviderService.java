package com.consistency.backend.service;

/**
 * Abstraction for SMS sending. Implementations include:
 * - MockSMSProviderService (development/testing, logs to console)
 * - TwilioSMSProviderService (production, requires credentials)
 */
public interface SMSProviderService {
    /**
     * Send an SMS message.
     * @param toNumber E.164 formatted number e.g. "+919876543210"
     * @param message  The SMS body
     * @return true if sent successfully, false otherwise
     */
    boolean sendSms(String toNumber, String message);

    /**
     * Returns true if real SMS credentials are configured.
     * If false, the application should fall back to the mock provider or skip SMS.
     */
    boolean isConfigured();
}
