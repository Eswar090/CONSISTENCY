package com.consistency.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

/**
 * Mock SMS provider for development and testing.
 * Logs the message to the console instead of sending a real SMS.
 * Active when SMS Twilio credentials are not configured.
 */
@Service
@Primary
@ConditionalOnProperty(name = "sms.twilio.account-sid", havingValue = "", matchIfMissing = true)
public class MockSMSProviderService implements SMSProviderService {

    private static final Logger logger = LoggerFactory.getLogger(MockSMSProviderService.class);

    @Override
    public boolean sendSms(String toNumber, String message) {
        // Extract OTP from message for clean logging
        String otp = "";
        if (message.contains("is ")) {
            otp = message.substring(message.indexOf("is ") + 3, message.indexOf("is ") + 9);
        }
        
        System.out.println("\n[MOCK SMS]");
        System.out.println("To: " + toNumber);
        System.out.println("OTP: " + (otp.isEmpty() ? message : otp));
        System.out.println("Expires in: 10 minutes\n");
        
        logger.info("[MOCK SMS] Sent to {}", toNumber);
        return true;
    }

    @Override
    public boolean isConfigured() {
        // Mock provider is always "configured" for development purposes
        // The controller returns smsConfigured=false so the UI can show the appropriate message
        return false;
    }

    private String maskNumber(String number) {
        if (number == null || number.length() < 4) return "****";
        return number.substring(0, number.length() - 4).replaceAll("\\d", "*")
               + number.substring(number.length() - 4);
    }
}
