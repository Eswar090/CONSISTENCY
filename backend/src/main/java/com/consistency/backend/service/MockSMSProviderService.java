package com.consistency.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Mock SMS provider for development and testing.
 * Logs the message to the console instead of sending a real SMS.
 * Instantiated by SmsProviderConfiguration when Twilio credentials are absent.
 */
public class MockSMSProviderService implements SMSProviderService {

    private static final Logger logger = LoggerFactory.getLogger(MockSMSProviderService.class);

    @jakarta.annotation.PostConstruct
    public void init() {
        logger.info("SMS provider: MOCK (No Twilio configuration detected)");
    }

    @Override
    public boolean sendSms(String toNumber, String message) {
        // Extract OTP from message for clean logging
        String otp = "";
        if (message.contains("is ")) {
            int start = message.indexOf("is ") + 3;
            int end   = Math.min(start + 6, message.length());
            otp = message.substring(start, end);
        }
        
        System.out.println("\n[MOCK SMS]");
        System.out.println("To: " + toNumber);
        System.out.println("OTP: " + (otp.isEmpty() ? message : otp));
        System.out.println("Expires in: 10 minutes\n");
        
        logger.info("[MOCK SMS] Sent to {}", maskNumber(toNumber));
        return true;
    }

    @Override
    public boolean isConfigured() {
        return false;
    }

    private String maskNumber(String number) {
        if (number == null || number.length() < 4) return "****";
        return number.substring(0, number.length() - 4).replaceAll("\\d", "*")
               + number.substring(number.length() - 4);
    }
}
