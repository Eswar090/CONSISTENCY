package com.consistency.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;

/**
 * Factory that selects either the real TwilioSMSProvider or the MockSMSProvider
 * at application startup, based on whether Twilio credentials are actually present
 * in the resolved Spring environment properties.
 *
 * This avoids the @ConditionalOnExpression / @ConditionalOnProperty pitfall where
 * property placeholders are evaluated before the Spring Environment is fully bound.
 */
@Configuration
public class SmsProviderConfiguration {

    private static final Logger logger = LoggerFactory.getLogger(SmsProviderConfiguration.class);

    @Value("${sms.twilio.account-sid:}")
    private String accountSid;

    @Value("${sms.twilio.auth-token:}")
    private String authToken;

    @Value("${sms.twilio.from-number:}")
    private String fromNumber;

    @Bean
    public SMSProviderService smsProviderService() {
        boolean hasAccountSid = accountSid != null && !accountSid.isBlank();
        boolean hasAuthToken  = authToken  != null && !authToken.isBlank();
        boolean hasFromNumber = fromNumber != null && !fromNumber.isBlank();
        boolean allConfigured = hasAccountSid && hasAuthToken && hasFromNumber;

        if (allConfigured) {
            logger.info("[PHASE12 SMS] SMS provider: TWILIO — credentials resolved from environment");
            logger.info("[PHASE12 SMS] Twilio account-sid present: true  |  auth-token present: true  |  from-number: {}", fromNumber);
            return new LiveTwilioSMSProvider(accountSid, authToken, fromNumber);
        } else {
            logger.warn("[PHASE12 SMS] SMS provider: MOCK — one or more Twilio credentials are blank");
            logger.warn("[PHASE12 SMS]   account-sid present: {}  |  auth-token present: {}  |  from-number present: {}",
                    hasAccountSid, hasAuthToken, hasFromNumber);
            return new MockSMSProviderService();
        }
    }

    // ─── Inner implementations ────────────────────────────────────

    /**
     * Live Twilio implementation — only instantiated when all 3 credentials are present.
     */
    static class LiveTwilioSMSProvider implements SMSProviderService {

        private static final Logger log = LoggerFactory.getLogger(LiveTwilioSMSProvider.class);
        private final String accountSid;
        private final String authToken;
        private final String fromNumber;
        private final RestTemplate restTemplate = new RestTemplate();

        LiveTwilioSMSProvider(String accountSid, String authToken, String fromNumber) {
            this.accountSid  = accountSid;
            this.authToken   = authToken;
            this.fromNumber  = fromNumber;
        }

        @Override
        public boolean sendSms(String toNumber, String message) {
            log.info("[PHASE12 TEST SMS] Twilio request starting — to={}", maskNumber(toNumber));
            try {
                String url = "https://api.twilio.com/2010-04-01/Accounts/" + accountSid + "/Messages.json";

                String credentials = accountSid + ":" + authToken;
                String basicAuth = "Basic " + Base64.getEncoder().encodeToString(credentials.getBytes());

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
                headers.set("Authorization", basicAuth);

                MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
                body.add("To",   toNumber);
                body.add("From", fromNumber);
                body.add("Body", message);

                HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
                ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

                String responseBody = response.getBody();
                log.info("[PHASE12 TEST SMS] Twilio response status: {}", response.getStatusCode());

                // Extract Message SID safely
                if (responseBody != null && responseBody.contains("\"sid\"")) {
                    int sidStart = responseBody.indexOf("\"sid\"") + 7;
                    int sidEnd   = responseBody.indexOf("\"", sidStart);
                    if (sidEnd > sidStart) {
                        String sid = responseBody.substring(sidStart, sidEnd);
                        log.info("[PHASE12 TEST SMS] Twilio Message SID: {}", sid);
                    }
                }

                if (response.getStatusCode().is2xxSuccessful()) {
                    log.info("[PHASE12 TEST SMS] SMS sent successfully via Twilio");
                    return true;
                } else {
                    log.error("[PHASE12 TEST SMS] Twilio returned non-2xx: {} body={}", response.getStatusCode(), responseBody);
                    return false;
                }

            } catch (HttpClientErrorException | HttpServerErrorException ex) {
                log.error("[PHASE12 TEST SMS] ERROR: Twilio HTTP error {} — {}", ex.getStatusCode(), ex.getResponseBodyAsString());
                return false;
            } catch (Exception e) {
                log.error("[PHASE12 TEST SMS] ERROR: {} — {}", e.getClass().getSimpleName(), e.getMessage());
                return false;
            }
        }

        @Override
        public boolean isConfigured() {
            return true; // Only instantiated when all creds are present
        }

        private String maskNumber(String number) {
            if (number == null || number.length() < 4) return "****";
            return number.substring(0, number.length() - 4).replaceAll("\\d", "*")
                   + number.substring(number.length() - 4);
        }
    }
}
