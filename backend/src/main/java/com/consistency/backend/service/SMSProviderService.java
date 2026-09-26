package com.consistency.backend.service;

/**
 * Abstraction for SMS sending. Implementations include:
 * - MockSMSProviderService (development/testing, logs to console)
 * - SmsProviderConfiguration.LiveTwilioSMSProvider (production, requires credentials)
 *
 * Selection is made at startup by SmsProviderConfiguration based on whether
 * the Twilio credentials are present in the resolved Spring Environment.
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
     * If false, the application is running in mock/dev mode.
     */
    boolean isConfigured();
}
