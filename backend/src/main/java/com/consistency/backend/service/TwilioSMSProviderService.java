package com.consistency.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;

/**
 * Twilio SMS provider for production use.
 * Active only when sms.twilio.account-sid is set to a non-empty value.
 * Uses plain HTTP calls to Twilio REST API — no Twilio SDK needed.
 */
@Service
@ConditionalOnProperty(name = "sms.twilio.account-sid", havingValue = "")
public class TwilioSMSProviderService implements SMSProviderService {

    private static final Logger logger = LoggerFactory.getLogger(TwilioSMSProviderService.class);

    @Value("${sms.twilio.account-sid:}")
    private String accountSid;

    @Value("${sms.twilio.auth-token:}")
    private String authToken;

    @Value("${sms.twilio.from-number:}")
    private String fromNumber;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public boolean sendSms(String toNumber, String message) {
        if (!isConfigured()) {
            logger.warn("Twilio not configured. SMS not sent.");
            return false;
        }
        try {
            String url = "https://api.twilio.com/2010-04-01/Accounts/" + accountSid + "/Messages.json";

            String credentials = accountSid + ":" + authToken;
            String basicAuth = "Basic " + Base64.getEncoder().encodeToString(credentials.getBytes());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            headers.set("Authorization", basicAuth);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("To", toNumber);
            body.add("From", fromNumber);
            body.add("Body", message);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                logger.info("SMS sent successfully via Twilio to masked number");
                return true;
            } else {
                logger.error("Twilio returned non-2xx status: {}", response.getStatusCode());
                return false;
            }
        } catch (Exception e) {
            logger.error("Failed to send SMS via Twilio: {}", e.getMessage());
            return false;
        }
    }

    @Override
    public boolean isConfigured() {
        return accountSid != null && !accountSid.isBlank()
            && authToken != null && !authToken.isBlank()
            && fromNumber != null && !fromNumber.isBlank();
    }
}
